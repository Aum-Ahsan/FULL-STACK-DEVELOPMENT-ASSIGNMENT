import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Task, TaskStatus } from '../tasks/task.entity';
import { TimeEntry } from '../time-entries/time-entry.entity';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(Task)
    private tasksRepository: Repository<Task>,
    @InjectRepository(TimeEntry)
    private timeEntriesRepository: Repository<TimeEntry>,
  ) { }

  async getStats(userId: string) {
    const now = new Date();

    // Today boundary
    const startOfToday = new Date(now);
    startOfToday.setHours(0, 0, 0, 0);

    // Week boundary
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const [
      completedToday,
      completedThisWeek,
      timeToday,
      timeThisWeek,
      categoryDist,
    ] = await Promise.all([
      // Tasks completed today
      this.tasksRepository.count({
        where: {
          userId,
          status: TaskStatus.COMPLETED,
          updatedAt: Between(startOfToday, now),
        },
      }),
      // Tasks completed this week
      this.tasksRepository.count({
        where: {
          userId,
          status: TaskStatus.COMPLETED,
          updatedAt: Between(startOfWeek, now),
        },
      }),
      // Total hours today (in seconds)
      this.timeEntriesRepository
        .createQueryBuilder('te')
        .leftJoin('te.task', 'task')
        .where('task.userId = :userId', { userId })
        .andWhere('te.startTime >= :startOfToday', { startOfToday })
        .select('SUM(te.duration)', 'total')
        .getRawOne(),
      // Total hours this week (in seconds)
      this.timeEntriesRepository
        .createQueryBuilder('te')
        .leftJoin('te.task', 'task')
        .where('task.userId = :userId', { userId })
        .andWhere('te.startTime >= :startOfWeek', { startOfWeek })
        .select('SUM(te.duration)', 'total')
        .getRawOne(),
      // Category distribution
      this.tasksRepository
        .createQueryBuilder('task')
        .where('task.userId = :userId', { userId })
        .select('task.category', 'name')
        .addSelect('SUM(task.totalTimeSpent)', 'value')
        .groupBy('task.category')
        .getRawMany(),
    ]);

    return {
      tasksCompletedToday: completedToday,
      tasksCompletedThisWeek: completedThisWeek,
      totalSecondsToday: parseInt((timeToday as any).total) || 0,
      totalSecondsThisWeek: parseInt((timeThisWeek as any).total) || 0,
      categoryDistribution: (categoryDist as any[]).map(item => ({
        name: (item as any).name || 'Uncategorized',
        value: parseInt((item as any).value) || 0
      })),
    };
  }
}
