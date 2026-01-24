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

  async createTask(
    boardId: string,
    name: string,
    description?: string,
    deadline?: string,
  ) {
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
      description: description?.trim() || null,
      deadline: deadline ? new Date(deadline) : null,
      status: TaskStatus.TODO,
      position: nextPos,
    });
  }

  async getTasks(boardId: string) {
    return this.taskRepo.find({
      where: { boardId },
      order: { status: 'ASC', position: 'ASC' },
    });
  }

  async getTaskDetail(taskId: string) {
    const task = await this.taskRepo.findOne({ where: { id: taskId } });
    if (!task) throw new NotFoundException('Task not found');
    return task;
  }

  async updateTask(
    taskId: string,
    updates: { name?: string; description?: string; deadline?: string },
  ) {
    const task = await this.taskRepo.findOne({ where: { id: taskId } });
    if (!task) throw new NotFoundException('Task not found');

    if (updates.name !== undefined) task.name = updates.name.trim();
    if (updates.description !== undefined)
      task.description = updates.description
        ? updates.description.trim()
        : null;
    if (updates.deadline !== undefined)
      task.deadline = updates.deadline ? new Date(updates.deadline) : null;

    return this.taskRepo.save(task);
  }

  async deleteTask(taskId: string) {
    const task = await this.taskRepo.findOne({ where: { id: taskId } });
    if (!task) throw new NotFoundException('Task not found');

    await this.taskRepo.delete({ id: taskId });
    return { ok: true };
  }

  async updateStatus(taskId: string, status: TaskStatus) {
    const task = await this.taskRepo.findOne({ where: { id: taskId } });
    if (!task) throw new NotFoundException('Task not found');

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

  async deleteByBoardId(boardId: string) {
    const result = await this.taskRepo.delete({ boardId });
    return result.affected ?? 0;
  }

  async setAssignees(taskId: string, userIds: string[]) {
    return this.assignUsers(taskId, userIds);
  }
  
}
