import { Test } from '@nestjs/testing';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import request from 'supertest';
import { DiagnosisController } from '../src/diagnosis/diagnosis.controller';
import { DiagnosisService } from '../src/diagnosis/diagnosis.service';
import { PrismaService } from '../src/common/prisma.service';
import { RecommendationService } from '../src/recommendation/recommendation.service';

const ruleSetMock = {
  id: 'rule-set-1',
  config: {
    axes: [
      { key: 'Sebum', weight: 1 },
      { key: 'Dryness', weight: 1 },
    ],
    questions: [
      { code: 'Q1', axis: 'Sebum', scale: 20 },
      { code: 'Q2', axis: 'Dryness', scale: 20 },
    ],
    labelMappings: [
      { key: 'Sebum', thresholds: { primary: 55, secondary: 45 } },
      { key: 'Dryness', thresholds: { primary: 55, secondary: 45 } },
    ],
    seasonModifiers: {},
    demographicModifiers: {},
    referralRules: [],
    weights: { fit: 0.4, ingredientSafety: 0.25, evidence: 0.15, review: 0.1, costPerformance: 0.1 },
  },
};

describe('/diagnoses (POST)', () => {
  let app: NestFastifyApplication;
  const prismaMock = {
    ruleSet: {
      findFirst: jest.fn().mockResolvedValue(ruleSetMock),
    },
    diagnosis: {
      create: jest.fn().mockResolvedValue({ id: 'diag-1' }),
      findUnique: jest.fn().mockResolvedValue({
        id: 'diag-1',
        labels: ['Sebum'],
        scores: { Sebum: 60 },
        recommendations: [{ productId: '1', score: 70, reason: 'テスト' }],
        medicalReferral: false,
      }),
    },
    diagnosisAnswer: {
      createMany: jest.fn().mockResolvedValue({}),
    },
    recommendationLog: {
      createMany: jest.fn().mockResolvedValue({}),
    },
    $transaction: jest.fn(async (cb: any) => cb(prismaMock)),
  } as unknown as PrismaService;

  const recommendationMock = {
    recommend: jest.fn().mockResolvedValue({
      items: [
        { productId: '1', score: 80, reason: ['適合度', '安全性', 'レビュー'] },
        { productId: '2', score: 70, reason: ['適合度', '安全性', 'コスパ'] },
      ],
    }),
  } as unknown as RecommendationService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [DiagnosisController],
      providers: [DiagnosisService, { provide: PrismaService, useValue: prismaMock }, { provide: RecommendationService, useValue: recommendationMock }],
    }).compile();

    app = moduleRef.createNestApplication<NestFastifyApplication>(new FastifyAdapter());
    await app.init();
    await app.getHttpAdapter().getInstance().ready();
  });

  afterAll(async () => {
    await app.close();
  });

  it('returns diagnosis result with recommendations', async () => {
    const response = await request(app.getHttpServer())
      .post('/diagnoses')
      .send({
        profile: { age: 35, sex: 'male' },
        answers: [
          { questionCode: 'Q1', value: 5 },
          { questionCode: 'Q2', value: 2 },
        ],
      })
      .expect(201);

    expect(response.body.labels).toContain('Sebum');
    expect(response.body.recommendations).toHaveLength(2);
  });
});
