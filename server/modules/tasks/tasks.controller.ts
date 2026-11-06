import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Req } from '@nestjs/common';
import { NeedLogin } from '@lark-apaas/fullstack-nestjs-core';
import type { Request } from 'express';
import { TasksService } from './tasks.service';
import { CreateTaskDto, UpdateTaskDto } from './dto/tasks.dto';
import type { TaskItem, TaskListResponse } from '@shared/api.interface';

@Controller('api/tasks')
@NeedLogin()
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Get()
  async list(@Query('priority') priority?: string): Promise<TaskListResponse> {
    return this.tasksService.list(priority);
  }

  @Post()
  async create(@Req() req: Request, @Body() dto: CreateTaskDto): Promise<TaskItem> {
    const { userId } = req.userContext;
    return this.tasksService.create(dto, userId);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Req() req: Request,
    @Body() dto: UpdateTaskDto,
  ): Promise<TaskItem> {
    const { userId } = req.userContext;
    return this.tasksService.update(id, dto, userId);
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<{ success: true }> {
    return this.tasksService.remove(id);
  }
}
