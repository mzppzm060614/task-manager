import { Injectable, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { isTaskPriority, type TaskItem, type TaskListResponse } from '@shared/api.interface';
import { CreateTaskDto, UpdateTaskDto } from './dto/tasks.dto';

interface MemoryTask {
  id: string;
  title: string;
  priority: string;
  isCompleted: boolean;
  createdAt: Date;
}

@Injectable()
export class TasksService {
  private memoryStore: Map<string, MemoryTask> = new Map();

  constructor(private readonly supabaseService: SupabaseService) {}

  async list(priority?: string): Promise<TaskListResponse> {
    if (this.supabaseService.available) {
      const rows = await this.supabaseService.listTasks(priority);
      const items: TaskItem[] = rows.map((row) => ({
        id: String(row.id),
        title: row.title,
        priority: isTaskPriority(row.priority) ? row.priority : 'medium',
        isCompleted: row.completed,
        createdAt: row.created_at,
      }));
      return { items };
    }

    let items = Array.from(this.memoryStore.values());
    if (priority) {
      items = items.filter((t) => t.priority === priority);
    }
    items.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    return {
      items: items.map((t) => this.mapMemoryItem(t)),
    };
  }

  async create(dto: CreateTaskDto, _userId: string): Promise<TaskItem> {
    if (this.supabaseService.available) {
      const row = await this.supabaseService.createTask(dto.title, dto.priority);
      return {
        id: String(row.id),
        title: row.title,
        priority: isTaskPriority(row.priority) ? row.priority : 'medium',
        isCompleted: row.completed,
        createdAt: row.created_at,
      };
    }

    const id = crypto.randomUUID();
    const task: MemoryTask = {
      id,
      title: dto.title,
      priority: dto.priority,
      isCompleted: false,
      createdAt: new Date(),
    };
    this.memoryStore.set(id, task);
    return this.mapMemoryItem(task);
  }

  async update(id: string, dto: UpdateTaskDto, _userId: string): Promise<TaskItem> {
    if (this.supabaseService.available) {
      const patch: { title?: string; priority?: string; completed?: boolean } = {};
      if (dto.title !== undefined) patch.title = dto.title;
      if (dto.priority !== undefined) patch.priority = dto.priority;
      if (dto.isCompleted !== undefined) patch.completed = dto.isCompleted;

      try {
        const row = await this.supabaseService.updateTask(id, patch);
        return {
          id: String(row.id),
          title: row.title,
          priority: isTaskPriority(row.priority) ? row.priority : 'medium',
          isCompleted: row.completed,
          createdAt: row.created_at,
        };
      } catch {
        throw new NotFoundException('任务不存在');
      }
    }

    const task = this.memoryStore.get(id);
    if (!task) {
      throw new NotFoundException('任务不存在');
    }
    if (dto.title !== undefined) task.title = dto.title;
    if (dto.priority !== undefined) task.priority = dto.priority;
    if (dto.isCompleted !== undefined) task.isCompleted = dto.isCompleted;
    this.memoryStore.set(id, task);
    return this.mapMemoryItem(task);
  }

  async remove(id: string): Promise<{ success: true }> {
    if (this.supabaseService.available) {
      try {
        await this.supabaseService.deleteTask(id);
        return { success: true };
      } catch {
        throw new NotFoundException('任务不存在');
      }
    }

    const existed = this.memoryStore.has(id);
    if (!existed) {
      throw new NotFoundException('任务不存在');
    }
    this.memoryStore.delete(id);
    return { success: true };
  }

  private mapMemoryItem(task: MemoryTask): TaskItem {
    return {
      id: task.id,
      title: task.title,
      priority: isTaskPriority(task.priority) ? task.priority : 'medium',
      isCompleted: task.isCompleted,
      createdAt: task.createdAt.toISOString(),
    };
  }
}
