import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

interface TaskRow {
  id: number;
  title: string;
  priority: string;
  completed: boolean;
  created_at: string;
}

const PRIORITY_TO_CN: Record<string, string> = {
  high: '高',
  medium: '中',
  low: '低',
};

const PRIORITY_FROM_CN: Record<string, string> = {
  高: 'high',
  中: 'medium',
  低: 'low',
};

@Injectable()
export class SupabaseService implements OnModuleInit {
  private readonly logger = new Logger(SupabaseService.name);
  private client: SupabaseClient | null = null;
  private isConfigured = false;

  onModuleInit(): void {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_ANON_KEY;
    if (url && key) {
      try {
        this.client = createClient(url, key, {
          auth: { persistSession: false, autoRefreshToken: false },
        });
        this.isConfigured = true;
        this.logger.log('Supabase 客户端已初始化');
      } catch (error) {
        this.logger.error('Supabase 客户端初始化失败', String(error));
        this.isConfigured = false;
      }
    } else {
      this.logger.warn('未配置 SUPABASE_URL / SUPABASE_ANON_KEY，使用内存存储演示模式');
    }
  }

  get available(): boolean {
    return this.isConfigured && this.client !== null;
  }

  getClient(): SupabaseClient {
    if (!this.client) {
      throw new Error('Supabase 未配置');
    }
    return this.client;
  }

  private toAppPriority(cn: string): string {
    return PRIORITY_FROM_CN[cn] ?? 'medium';
  }

  private toDbPriority(app: string): string {
    return PRIORITY_TO_CN[app] ?? '中';
  }

  private mapRow(row: TaskRow): TaskRow {
    return { ...row, priority: this.toAppPriority(row.priority) };
  }

  async listTasks(priority?: string): Promise<TaskRow[]> {
    if (!this.available) throw new Error('Supabase unavailable');
    const client = this.getClient();
    let query = client.from('tasks').select('*').order('created_at', { ascending: false });
    if (priority) {
      query = query.eq('priority', this.toDbPriority(priority));
    }
    const { data, error } = await query;
    if (error) throw error;
    const rows = (data as TaskRow[]) || [];
    return rows.map((row: TaskRow) => this.mapRow(row));
  }

  async createTask(title: string, priority: string): Promise<TaskRow> {
    if (!this.available) throw new Error('Supabase unavailable');
    const client = this.getClient();
    const { data, error } = await client
      .from('tasks')
      .insert({ title, priority: this.toDbPriority(priority), completed: false })
      .select()
      .single();
    if (error) throw error;
    return this.mapRow(data as TaskRow);
  }

  async updateTask(
    id: string,
    patch: { title?: string; priority?: string; completed?: boolean },
  ): Promise<TaskRow> {
    if (!this.available) throw new Error('Supabase unavailable');
    const client = this.getClient();
    const dbPatch: Record<string, unknown> = { ...patch };
    if (patch.priority !== undefined) {
      dbPatch.priority = this.toDbPriority(patch.priority);
    }
    const { data, error } = await client
      .from('tasks')
      .update(dbPatch)
      .eq('id', Number(id))
      .select()
      .single();
    if (error) throw error;
    return this.mapRow(data as TaskRow);
  }

  async deleteTask(id: string): Promise<void> {
    if (!this.available) throw new Error('Supabase unavailable');
    const client = this.getClient();
    const { error } = await client.from('tasks').delete().eq('id', Number(id));
    if (error) throw error;
  }
}
