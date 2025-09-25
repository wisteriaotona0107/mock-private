import { Module } from '@nestjs/common';
import { PrismaModule } from '../common/prisma.module';
import { DiagnosisService } from './diagnosis.service';
import { DiagnosisController } from './diagnosis.controller';
import { RecommendationModule } from '../recommendation/recommendation.module';

@Module({
  imports: [PrismaModule, RecommendationModule],
  providers: [DiagnosisService],
  controllers: [DiagnosisController],
})
export class DiagnosisModule {}
