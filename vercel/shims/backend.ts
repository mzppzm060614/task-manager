/**
 * Vercel 静态部署用的后端垫片。
 *
 * 原项目前端通过 axiosForBackend 调用自己的 NestJS 接口 /api/tasks。
 * Vercel 上只部署静态产物，无法运行常驻 NestJS 进程，因此这里用一个
 * 形态兼容的最小实现，直接通过 @supabase/supabase-js 读写 Supabase 的 tasks 表。
 *
 * 保持与原接口一致的语义：
 *   GET    /api/tasks        -> { items: TaskItem[] }
 *   POST   /api/tasks        -> TaskItem
 *   PATCH  /api/tasks/:id    -> TaskItem
 *   DELETE /api/tasks/:id    -> void
 */
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = (import.meta.env.VITE_SUPABASE_URL as string) || '';
const SUPABASE_ANON_KEY = (import.meta.env.VITE_SUPABASE_ANON_KEY as string) || '';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: { persistSession: false },
});

type UiPriority = 'high' | 'medium' | 'low';

const UI_TO_DB: Record<UiPriority, string> = { high: '高', medium: '中', low: '低' };
const DB_TO_UI: Record<string, UiPriority> = { 高: 'high', 中: 'medium', 低: 'low' };

interface TaskRow {
  id: number | string;
  title: string;
  priority: string;
  completed: boolean;
  created_at: string;
}

function mapRow(row: TaskRow) {
  return {
    id: String(row.id),
    title: row.title,
    priority: DB_TO_UI[row.priority] ?? 'medium',
    isCompleted: Boolean(row.completed),
    createdAt: row.created_at,
  };
}

function idFromUrl(url: string): string {
  return url.split('/').filter(Boolean).pop() as string;
}

export const axiosForBackend = {
  async get(url: string, config?: { params?: Record<string, string> }) {
    const priority = config?.params?.priority;
    let query = supabase.from('tasks').select('*');
    if (priority && UI_TO_DB[priority as UiPriority]) {
      query = query.eq('priority', UI_TO_DB[priority as UiPriority]);
    }
    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) throw error;
    return { data: { items: (data ?? []).map(mapRow) } };
  },

  async post(url: string, body: { title: string; priority: UiPriority }) {
    const { data, error } = await supabase
      .from('tasks')
      .insert({
        title: body.title,
        priority: UI_TO_DB[body.priority] ?? '中',
        completed: false,
      })
      .select()
      .single();
    if (error) throw error;
    return { data: mapRow(data as TaskRow) };
  },

  async patch(
    url: string,
    body: { isCompleted?: boolean; priority?: UiPriority; title?: string },
  ) {
    const patch: Record<string, unknown> = {};
    if (body.isCompleted !== undefined) patch.completed = body.isCompleted;
    if (body.priority && UI_TO_DB[body.priority]) patch.priority = UI_TO_DB[body.priority];
    if (body.title !== undefined) patch.title = body.title;

    const { data, error } = await supabase
      .from('tasks')
      .update(patch)
      .eq('id', idFromUrl(url))
      .select()
      .single();
    if (error) throw error;
    return { data: mapRow(data as TaskRow) };
  },

  async delete(url: string) {
    const { error } = await supabase.from('tasks').delete().eq('id', idFromUrl(url));
    if (error) throw error;
    return { data: null };
  },
};

export default axiosForBackend;
