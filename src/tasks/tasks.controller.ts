import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Param,
  Body,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import { TasksService } from './tasks.service';
import { TaskStatus } from './task-status.enum';
import { BoardPermissionClient } from 'src/permissions/board-permission';

@Controller('tasks')
export class TasksController {
  constructor(
    private tasksService: TasksService,
    private boardPerm: BoardPermissionClient,
  ) {}

  private getUserId(req: any) {
    const userId = req.headers['x-user-id'] as string | undefined;
    if (!userId) throw new UnauthorizedException('Missing x-user-id');
    return userId;
  }

  @Post()
  async create(
    @Req() req: any,
    @Body('boardId') boardId: string,
    @Body('name') name: string,
    @Body('description') description?: string,
    @Body('deadline') deadline?: string,
  ) {
    const userId = this.getUserId(req);
    await this.boardPerm.requireWrite(boardId, userId);

    return this.tasksService.createTask(boardId, name, description, deadline);
  }

  @Get('board/:boardId')
  async getByBoard(@Param('boardId') boardId: string, @Req() req: any) {
    const userId = this.getUserId(req);
    await this.boardPerm.requireRead(boardId, userId);

    return this.tasksService.getTasks(boardId);
  }

  @Get(':id')
  async getDetail(@Param('id') taskId: string, @Req() req: any) {
    const userId = this.getUserId(req);

    // need boardId to check access
    const task = await this.tasksService.getTaskDetail(taskId);
    await this.boardPerm.requireRead(task.boardId, userId);

    return task;
  }

  @Patch(':id/status')
  async updateStatus(
    @Param('id') taskId: string,
    @Body('status') status: TaskStatus,
    @Req() req: any,
  ) {
    const userId = this.getUserId(req);

    const task = await this.tasksService.getTaskDetail(taskId);
    await this.boardPerm.requireWrite(task.boardId, userId);

    return this.tasksService.updateStatus(taskId, status);
  }

  @Patch(':id')
  async updateTask(
    @Req() req: any,
    @Param('id') taskId: string,
    @Body('name') name?: string,
    @Body('description') description?: string,
    @Body('deadline') deadline?: string,
  ) {
    const userId = this.getUserId(req);

    const task = await this.tasksService.getTaskDetail(taskId);
    await this.boardPerm.requireWrite(task.boardId, userId);

    return this.tasksService.updateTask(taskId, {
      name,
      description,
      deadline,
    });
  }

  @Delete(':id')
  async delete(@Param('id') taskId: string, @Req() req: any) {
    const userId = this.getUserId(req);

    const task = await this.tasksService.getTaskDetail(taskId);
    await this.boardPerm.requireWrite(task.boardId, userId);

    return this.tasksService.deleteTask(taskId);
  }

  @Delete('board/:boardId')
  async deleteByBoard(@Param('boardId') boardId: string, @Req() req: any) {
    const userId = this.getUserId(req);
    await this.boardPerm.requireWrite(boardId, userId);

    const deletedCount = await this.tasksService.deleteByBoardId(boardId);
    return { message: 'Tasks deleted', boardId, deletedCount };
  }

  @Get(':id/assignees')
  async getAssignees(@Param('id') taskId: string, @Req() req: any) {
    const userId = this.getUserId(req);

    const task = await this.tasksService.getTaskDetail(taskId);
    await this.boardPerm.requireRead(task.boardId, userId);

    return this.tasksService.getAssignees(taskId);
  }

  @Patch(':id/assignees')
  async setAssignees(
    @Param('id') taskId: string,
    @Body('userIds') userIds: string[],
    @Req() req: any,
  ) {
    const userId = this.getUserId(req);

    const task = await this.tasksService.getTaskDetail(taskId);
    await this.boardPerm.requireWrite(task.boardId, userId);

    return this.tasksService.setAssignees(taskId, userIds || []);
  }
}
