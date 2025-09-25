import { Module } from '@nestjs/common';
import { PrismaModule } from '../common/prisma.module';
import { AdminRuleSetController } from './admin.rule-set.controller';
import { RolesGuard } from '../common/guards/roles.guard';

@Module({
  imports: [PrismaModule],
  controllers: [AdminRuleSetController],
  providers: [RolesGuard],
})
export class AdminModule {}
