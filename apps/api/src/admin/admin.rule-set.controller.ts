import { Controller, Get, Param, Patch, Req, UseGuards } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { UserRole } from '@prisma/client';

@Controller('admin/rule-sets')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.admin)
export class AdminRuleSetController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  list() {
    return this.prisma.ruleSet.findMany({ orderBy: { createdAt: 'desc' } });
  }

  @Patch(':id/activate')
  async activate(@Param('id') id: string, @Req() req: any) {
    await this.prisma.$transaction(async (tx) => {
      await tx.ruleSet.updateMany({ data: { active: false }, where: {} });
      await tx.ruleSet.update({ where: { id }, data: { active: true } });
      await tx.auditLog.create({
        data: {
          actorId: req.user.userId,
          entityType: 'ruleSet',
          entityId: id,
          action: 'activate',
          after: { active: true },
        },
      });
    });
    return { status: 'ok' };
  }
}
