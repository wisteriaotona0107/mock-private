import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { routineCheckinSchema, routineCreateSchema } from '@scalp-care/shared';

@Injectable()
export class RoutineService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, payload: unknown) {
    const data = routineCreateSchema.parse(payload);
    return this.prisma.$transaction(async (tx) => {
      const routine = await tx.routine.create({
        data: {
          userId,
          title: data.title,
          description: data.description,
          frequency: data.frequency,
        },
      });
      await tx.routineItem.createMany({
        data: data.items.map((item, index) => ({
          routineId: routine.id,
          name: item.name,
          schedule: item.schedule,
          order: index,
        })),
      });
      return routine;
    });
  }

  async checkin(userId: string, routineId: string, payload: unknown) {
    const data = routineCheckinSchema.parse(payload);
    const routine = await this.prisma.routine.findFirst({ where: { id: routineId, userId } });
    if (!routine) {
      throw new NotFoundException('ルーティンが見つかりません');
    }
    const checkin = await this.prisma.routineCheckin.upsert({
      where: {
        routineId_date: {
          routineId,
          date: new Date(data.date),
        },
      },
      update: {
        completed: data.completed,
      },
      create: {
        routineId,
        date: new Date(data.date),
        completed: data.completed,
      },
    });
    return checkin;
  }
}
