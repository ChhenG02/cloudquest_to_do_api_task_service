import {
  Controller,
  Post,
  Get,
  Patch,
  Param,
  Body,
} from '@nestjs/common';
import { TasksService } from './tasks.service';
import { TaskStatus } from './task-status.enum';

@Controller('tasks')
export class TasksController {
  constructor(private tasksService: TasksService) {}

  @Post()
  create(
    @Body('boardId') boardId: string,
    @Body('name') name: string,
  ) {
    return this.tasksService.createTask(boardId, name);
  }

  @Get(':boardId')
  getByBoard(@Param('boardId') boardId: string) {
    return this.tasksService.getTasks(boardId);
  }

  @Patch(':id/status')
  updateStatus(
    @Param('id') taskId: string,
    @Body('status') status: TaskStatus,
  ) {
    return this.tasksService.updateStatus(taskId, status);
  }

  @Patch(':id/assign')
  assign(
    @Param('id') taskId: string,
    @Body('userIds') userIds: string[],
  ) {
    return this.tasksService.assignUsers(taskId, userIds);
  }

  @Get(':id/assignees')
  getAssignees(@Param('id') taskId: string) {
    return this.tasksService.getAssignees(taskId);
  }
}
