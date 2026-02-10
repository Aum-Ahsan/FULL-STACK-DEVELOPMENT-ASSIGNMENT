import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { TimeEntry } from './time-entry.entity';
import { TasksService } from '../tasks/tasks.service';

@Injectable()
export class TimeEntriesService {
  constructor(
    @InjectRepository(TimeEntry)
    private timeEntriesRepository: Repository<TimeEntry>,
    private tasksService: TasksService,
  ) {}

  async startTimer(taskId: string, userId: string): Promise<TimeEntry> {
    // Check if task belongs to user
    await this.tasksService.findOne(taskId, userId);

    // Check if there is already an active timer for THIS task or ANY other task?
    // The requirement says: "Prevent multiple timers running at the same time"
    // Usually this means per user.

    // Find any running timer for this user's tasks
    const activeTimer = await this.timeEntriesRepository.findOne({
      where: {
        endTime: IsNull(),
        task: { userId: userId },
      },
      relations: ['task'],
    });

    if (activeTimer) {
      throw new BadRequestException(
        'Another timer is already running. Stop it first.',
      );
    }

    const timeEntry = this.timeEntriesRepository.create({
      taskId,
      startTime: new Date(),
    });

    return this.timeEntriesRepository.save(timeEntry);
  }

  async stopTimer(taskId: string, userId: string): Promise<TimeEntry> {
    // Check if task belongs to user
    await this.tasksService.findOne(taskId, userId);

    const activeTimer = await this.timeEntriesRepository.findOne({
      where: {
        taskId,
        endTime: IsNull(),
      },
    });

    if (!activeTimer) {
      throw new BadRequestException('No active timer found for this task');
    }

    activeTimer.endTime = new Date();
    activeTimer.duration = Math.floor(
      (activeTimer.endTime.getTime() - activeTimer.startTime.getTime()) / 1000,
    );

    const savedEntry = await this.timeEntriesRepository.save(activeTimer);

    // Update total time in task
    await this.tasksService.updateTime(taskId, activeTimer.duration);

    return savedEntry;
  }

  async getActiveTimer(userId: string): Promise<TimeEntry | null> {
    return this.timeEntriesRepository.findOne({
      where: {
        endTime: IsNull(),
        task: { userId: userId },
      },
      relations: ['task'],
    });
  }

  async getTimeSpentToday(userId: string): Promise<number> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const entries = await this.timeEntriesRepository.find({
      where: {
        task: { userId },
        startTime: today, // This is simplified, real logic would need a range
      },
    });
    // For simplicity, I'll calculate in memory or use a more complex query
    // Let's use a query builder for better precision
    const result = await this.timeEntriesRepository
      .createQueryBuilder('te')
      .leftJoin('te.task', 'task')
      .where('task.userId = :userId', { userId })
      .andWhere('te.startTime >= :today', { today })
      .select('SUM(te.duration)', 'total')
      .getRawOne();

    return parseInt(result.total) || 0;
  }
}
