import { Controller, Post, Get, Patch, Delete, Param, Body } from "@nestjs/common";
import { TasksService } from "./tasks.service";
import { TaskStatus } from "./task-status.enum";

@Controller("tasks")
export class TasksController {
  constructor(private tasksService: TasksService) {}

  @Post()
  create(
    @Body("boardId") boardId: string,
    @Body("name") name: string,
    @Body("description") description?: string,
    @Body("deadline") deadline?: string, 
  ) {
    return this.tasksService.createTask(boardId, name, description, deadline);
  }

  @Get("board/:boardId")
  getByBoard(@Param("boardId") boardId: string) {
    return this.tasksService.getTasks(boardId);
  }

  @Get(":id")
  getDetail(@Param("id") taskId: string) {
    return this.tasksService.getTaskDetail(taskId);
  }

  @Patch(":id/status")
  updateStatus(@Param("id") taskId: string, @Body("status") status: TaskStatus) {
    return this.tasksService.updateStatus(taskId, status);
  }

  @Patch(":id")
  updateTask(
    @Param("id") taskId: string,
    @Body("name") name?: string,
    @Body("description") description?: string,
    @Body("deadline") deadline?: string, 
  ) {
    return this.tasksService.updateTask(taskId, { name, description, deadline });
  }

  @Delete(":id")
  delete(@Param("id") taskId: string) {
    return this.tasksService.deleteTask(taskId);
  }

    @Delete("board/:boardId")
  async deleteByBoard(@Param("boardId") boardId: string) {
    const deletedCount = await this.tasksService.deleteByBoardId(boardId);
    return { message: "Tasks deleted", boardId, deletedCount };
  }
}
