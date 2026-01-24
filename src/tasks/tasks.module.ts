import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Task } from './task.entity';
import { TaskAssignee } from './task-assignee.entity';
import { TasksService } from './tasks.service';
import { TasksController } from './tasks.controller';
import { BoardPermissionClient } from 'src/permissions/board-permission';
import { HttpModule } from '@nestjs/axios';



@Module({
  imports: [TypeOrmModule.forFeature([Task, TaskAssignee]), HttpModule],
  providers: [TasksService, BoardPermissionClient],
  controllers: [TasksController],
})
export class TasksModule {}

