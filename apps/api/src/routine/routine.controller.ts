import { Body, Controller, Param, Post, Req, UseGuards } from '@nestjs/common';
import { RoutineService } from './routine.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('routines')
@UseGuards(JwtAuthGuard)
export class RoutineController {
  constructor(private readonly routineService: RoutineService) {}

  @Post()
  create(@Req() req: any, @Body() body: unknown) {
    return this.routineService.create(req.user.userId, body);
  }

  @Post(':id/checkins')
  checkin(@Req() req: any, @Param('id') id: string, @Body() body: unknown) {
    return this.routineService.checkin(req.user.userId, id, body);
  }
}
