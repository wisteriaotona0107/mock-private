import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import {
  computeDiagnosis,
  diagnosisRequestSchema,
  ruleSetConfigSchema,
  DiagnosisResponse,
  RuleSetConfig,
} from '@scalp-care/shared';
import { RecommendationService } from '../recommendation/recommendation.service';

@Injectable()
export class DiagnosisService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly recommendationService: RecommendationService,
  ) {}

  async create(userId: string | null, payload: unknown): Promise<DiagnosisResponse> {
    const data = diagnosisRequestSchema.parse(payload);
    const ruleSet = await this.prisma.ruleSet.findFirst({
      where: data.ruleSetId ? { id: data.ruleSetId } : { active: true },
    });
    if (!ruleSet) {
      throw new NotFoundException('診断ルールが見つかりません');
    }
    const config = ruleSetConfigSchema.parse(ruleSet.config) as RuleSetConfig;
    const result = computeDiagnosis({
      answers: data.answers,
      profile: data.profile,
      ruleSetConfig: config,
      filters: data.filters,
    });
    const diagnosis = await this.prisma.$transaction(async (tx) => {
      const created = await tx.diagnosis.create({
        data: {
          userId: userId ?? undefined,
          ruleSetId: ruleSet.id,
          scores: result.scores,
          labels: result.labels,
          season: result.season,
          profile: data.profile,
          medicalReferral: result.medicalReferral,
        },
      });
      await tx.diagnosisAnswer.createMany({
        data: data.answers.map((answer) => ({
          diagnosisId: created.id,
          questionCode: answer.questionCode,
          value: answer.value as any,
        })),
      });
      return created;
    });

    const recommendations = await this.recommendationService.recommend({
      labels: result.labels,
      scores: result.scores,
      filters: data.filters,
    });

    await this.prisma.recommendationLog.createMany({
      data: recommendations.items.map((item, index) => ({
        diagnosisId: diagnosis.id,
        productId: item.productId,
        rank: index + 1,
        score: item.score,
        reason: item.reason.join(' / '),
      })),
    });

    return {
      id: diagnosis.id,
      scores: result.scores,
      labels: result.labels,
      recommendations: recommendations.items.map((item) => ({
        productId: item.productId,
        score: item.score,
        reason: item.reason.join(' / '),
      })),
      medicalReferral: result.medicalReferral,
    };
  }

  async findOne(id: string) {
    const diagnosis = await this.prisma.diagnosis.findUnique({
      where: { id },
      include: { recommendations: true },
    });
    if (!diagnosis) {
      throw new NotFoundException('診断が見つかりません');
    }
    return diagnosis;
  }
}
