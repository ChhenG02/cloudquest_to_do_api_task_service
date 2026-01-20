// tasks.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Task } from './task.entity';
import { TaskAssignee } from './task-assignee.entity';
import { TaskStatus } from './task-status.enum';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task) private taskRepo: Repository<Task>,
    @InjectRepository(TaskAssignee)
    private assigneeRepo: Repository<TaskAssignee>,
  ) {}

  async createTask(boardId: string, name: string) {
    const row = await this.taskRepo
      .createQueryBuilder('t')
      .select('COALESCE(MAX(t.position), 0)', 'max')
      .where('t.boardId = :boardId', { boardId })
      .andWhere('t.status = :status', { status: TaskStatus.TODO })
      .getRawOne<{ max: string }>();

    const maxPos = Number(row?.max ?? 0);
    const nextPos = maxPos + 1;

    return this.taskRepo.save({
      boardId,
      name,
      status: TaskStatus.TODO,
      position: nextPos, // ✅ bottom
    });
  }

  async getTasks(boardId: string) {
    // ✅ always return sorted tasks
    return this.taskRepo.find({
      where: { boardId },
      order: { status: 'ASC', position: 'ASC' },
    });
  }

  async updateStatus(taskId: string, status: TaskStatus) {
    const task = await this.taskRepo.findOne({ where: { id: taskId } });
    if (!task) throw new NotFoundException('Task not found');

    // move to bottom of target column
    const row = await this.taskRepo
      .createQueryBuilder('t')
      .select('COALESCE(MAX(t.position), 0)', 'max')
      .where('t.boardId = :boardId', { boardId: task.boardId })
      .andWhere('t.status = :status', { status })
      .getRawOne<{ max: string }>();

    const maxPos = Number(row?.max ?? 0);

    task.status = status;
    task.position = maxPos + 1;

    return this.taskRepo.save(task);
  }

  async assignUsers(taskId: string, userIds: string[]) {
    const task = await this.taskRepo.findOne({ where: { id: taskId } });
    if (!task) throw new NotFoundException('Task not found');

    await this.assigneeRepo.delete({ taskId });

    const assignees = userIds.map((userId) => ({ taskId, userId }));
    return this.assigneeRepo.save(assignees);
  }

  async getAssignees(taskId: string) {
    return this.assigneeRepo.find({ where: { taskId } });
  }

  // ✅ NEW: reorder tasks within a column
  async reorderColumn(
    boardId: string,
    status: TaskStatus,
    orderedTaskIds: string[],
  ) {
    if (!orderedTaskIds?.length) return { ok: true };

    // (optional) validate tasks belong to same board + status
    const tasks = await this.taskRepo.findByIds(orderedTaskIds);
    for (const t of tasks) {
      if (t.boardId !== boardId || t.status !== status) {
        throw new NotFoundException('Invalid reorder payload');
      }
    }

    // set position = 1..N based on new order
    // simplest safe approach: update one by one (ok for small lists)
    for (let i = 0; i < orderedTaskIds.length; i++) {
      await this.taskRepo.update(
        { id: orderedTaskIds[i] },
        { position: i + 1 },
      );
    }

    return { ok: true };
  }
}
