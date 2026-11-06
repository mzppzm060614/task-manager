export const TASK_PRIORITIES = ['high', 'medium', 'low'] as const;
export type TaskPriority = (typeof TASK_PRIORITIES)[number];
export const isTaskPriority = (v: string): v is TaskPriority =>
  (TASK_PRIORITIES as readonly string[]).includes(v);
export const TASK_PRIORITY_LABELS: Record<TaskPriority, string> = {
  high: '高',
  medium: '中',
  low: '低',
};

export interface TaskItem {
  id: string;
  title: string;
  priority: TaskPriority;
  isCompleted: boolean;
  createdAt: string;
}

export interface TaskListResponse {
  items: TaskItem[];
}

export interface CreateTaskRequest {
  title: string;
  priority: TaskPriority;
}

export interface UpdateTaskRequest {
  title?: string;
  priority?: TaskPriority;
  isCompleted?: boolean;
}
