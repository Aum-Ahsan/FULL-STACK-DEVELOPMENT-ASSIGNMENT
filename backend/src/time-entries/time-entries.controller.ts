import {
  Controller,
  Post,
  Get,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { TimeEntriesService } from './time-entries.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('tasks')
@UseGuards(JwtAuthGuard)
export class TimeEntriesController {
  constructor(private readonly timeEntriesService: TimeEntriesService) {}

  @Post(':id/start-timer')
  startTimer(@Param('id') id: string, @Request() req: any) {
    return this.timeEntriesService.startTimer(id, req.user.userId);
  }

  @Post(':id/stop-timer')
  stopTimer(@Param('id') id: string, @Request() req: any) {
    return this.timeEntriesService.stopTimer(id, req.user.userId);
  }

  @Get('active-timer')
  getActiveTimer(@Request() req: any) {
    return this.timeEntriesService.getActiveTimer(req.user.userId);
  }
}
