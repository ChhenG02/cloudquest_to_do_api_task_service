import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Task } from './task.entity';
import { TaskAssignee } from './task-assignee.entity';
import { TaskStatus } from './task-status.enum';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task)
    private taskRepo: Repository<Task>,
    @InjectRepository(TaskAssignee)
    private assigneeRepo: Repository<TaskAssignee>,
  ) {}

  async createTask(boardId: string, name: string) {
    return this.taskRepo.save({
      boardId,
      name,
      status: TaskStatus.TODO,
    });
  }

  async getTasks(boardId: string) {
    return this.taskRepo.find({ where: { boardId } });
  }

  async updateStatus(taskId: string, status: TaskStatus) {
    const task = await this.taskRepo.findOne({ where: { id: taskId } });
    if (!task) throw new NotFoundException('Task not found');

    task.status = status;
    return this.taskRepo.save(task);
  }

  async assignUsers(taskId: string, userIds: string[]) {
    const task = await this.taskRepo.findOne({ where: { id: taskId } });
    if (!task) throw new NotFoundException('Task not found');

    await this.assigneeRepo.delete({ taskId });

    const assignees = userIds.map(userId => ({
      taskId,
      userId,
    }));

    return this.assigneeRepo.save(assignees);
  }

  async getAssignees(taskId: string) {
    return this.assigneeRepo.find({ where: { taskId } });
  }
}
