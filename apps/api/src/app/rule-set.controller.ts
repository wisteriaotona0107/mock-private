import { Controller, Get } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';

@Controller('rule-sets')
export class RuleSetController {
  constructor(private readonly prisma: PrismaService) {}

  @Get('active')
  async active() {
    const ruleSet = await this.prisma.ruleSet.findFirst({ where: { active: true } });
    if (!ruleSet) {
      return null;
    }
    return ruleSet;
  }
}
