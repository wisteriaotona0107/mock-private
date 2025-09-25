import { Module } from '@nestjs/common';
import { PrismaModule } from '../common/prisma.module';
import { RoutineService } from './routine.service';
import { RoutineController } from './routine.controller';

@Module({
  imports: [PrismaModule],
  providers: [RoutineService],
  controllers: [RoutineController],
})
export class RoutineModule {}
