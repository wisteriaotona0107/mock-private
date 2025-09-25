import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { PrismaModule } from '../common/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { DiagnosisModule } from '../diagnosis/diagnosis.module';
import { RecommendationModule } from '../recommendation/recommendation.module';
import { ProductModule } from '../product/product.module';
import { RoutineModule } from '../routine/routine.module';
import { AdminModule } from '../admin/admin.module';
import { RuleSetController } from './rule-set.controller';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    CacheModule.register({ isGlobal: true }),
    ThrottlerModule.forRoot({ ttl: 60, limit: 100 }),
    PrismaModule,
    AuthModule,
    DiagnosisModule,
    RecommendationModule,
    ProductModule,
    RoutineModule,
    AdminModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
  controllers: [RuleSetController],
})
export class AppModule {}
