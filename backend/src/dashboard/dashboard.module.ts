import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DashboardService } from './dashboard.service';
import { DashboardController } from './dashboard.controller';
import { Task } from '../tasks/task.entity';
import { TimeEntry } from '../time-entries/time-entry.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Task, TimeEntry])],
  providers: [DashboardService],
  controllers: [DashboardController],
})
export class DashboardModule {}
