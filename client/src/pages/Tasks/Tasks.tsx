import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Check, Plus, Trash2 } from 'lucide-react';

import { Button } from '@client/src/components/ui/button';
import { Input } from '@client/src/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@client/src/components/ui/select';
import { Badge } from '@client/src/components/ui/badge';
import { Card, CardContent } from '@client/src/components/ui/card';

import {
  TASK_PRIORITIES,
  TASK_PRIORITY_LABELS,
  type TaskItem,
  type TaskPriority,
} from '@shared/api.interface';

import {
  createTask,
  deleteTask,
  fetchTasks,
  updateTask,
} from '@client/src/api/tasks';

const FILTER_OPTIONS = [
  { value: 'all', label: '全部' },
  ...TASK_PRIORITIES.map((p) => ({ value: p, label: TASK_PRIORITY_LABELS[p] })),
];

function getPriorityBadgeVariant(priority: TaskPriority): string {
  switch (priority) {
    case 'high':
      return 'bg-red-100 text-red-800 border-transparent';
    case 'medium':
      return 'bg-yellow-100 text-yellow-800 border-transparent';
    case 'low':
      return 'bg-green-100 text-green-800 border-transparent';
    default:
      return '';
  }
}

const TasksPage: React.FC = () => {
  const queryClient = useQueryClient();

  const [title, setTitle] = useState('');
  const [newPriority, setNewPriority] = useState<TaskPriority>('medium');
  const [priorityFilter, setPriorityFilter] = useState('all');

  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ['tasks', priorityFilter],
    queryFn: () => fetchTasks(priorityFilter),
  });

  const createMutation = useMutation({
    mutationFn: (data: { title: string; priority: TaskPriority }) =>
      createTask(data),
    retry: false,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast.success('任务创建成功');
      setTitle('');
      setNewPriority('medium');
    },
    onError: () => {
      toast.error('任务创建失败');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: { isCompleted?: boolean; priority?: string; title?: string };
    }) => updateTask(id, data),
    retry: false,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast.success('任务状态已更新');
    },
    onError: () => {
      toast.error('任务更新失败');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteTask(id),
    retry: false,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast.success('任务已删除');
    },
    onError: () => {
      toast.error('任务删除失败');
    },
  });

  const handleAddTask = () => {
    const trimmed = title.trim();
    if (!trimmed) {
      toast.error('请输入任务标题');
      return;
    }
    createMutation.mutate({ title: trimmed, priority: newPriority });
  };

  const handleToggleComplete = (task: TaskItem) => {
    updateMutation.mutate({
      id: task.id,
      data: { isCompleted: !task.isCompleted },
    });
  };

  const handleDelete = (id: string) => {
    deleteMutation.mutate(id);
  };

  const sortedTasks = [...tasks].sort(
    (a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-foreground">任务管理</h1>
          <p className="text-sm text-muted-foreground">
            管理你的待办事项，高效完成每一项任务
          </p>
        </div>

        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col gap-3 sm:flex-row">
              <Input
                placeholder="输入任务标题..."
                value={title}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setTitle(e.target.value)
                }
                onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                  if (e.key === 'Enter') handleAddTask();
                }}
                className="flex-1"
              />
              <Select
                value={newPriority}
                onValueChange={(val: string) =>
                  setNewPriority(val as TaskPriority)
                }
              >
                <SelectTrigger className="w-full sm:w-[120px]">
                  <SelectValue placeholder="优先级" />
                </SelectTrigger>
                <SelectContent>
                  {TASK_PRIORITIES.map((p) => (
                    <SelectItem key={p} value={p}>
                      {TASK_PRIORITY_LABELS[p]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                onClick={handleAddTask}
                disabled={createMutation.isPending}
              >
                <Plus className="h-4 w-4" />
                添加任务
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">任务列表</h2>
          <Select value={priorityFilter} onValueChange={setPriorityFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="筛选优先级" />
            </SelectTrigger>
            <SelectContent>
              {FILTER_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {isLoading ? (
          <div className="py-12 text-center text-muted-foreground">
            加载中...
          </div>
        ) : sortedTasks.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">暂无任务</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3" data-ai-section-type="card-list">
            {sortedTasks.map((task: TaskItem) => (
              <Card
                key={task.id}
                className={task.isCompleted ? 'opacity-60' : ''}
              >
                <CardContent className="flex items-center gap-4 pt-6">
                  <div className="min-w-0 flex-1">
                    <div
                      className={`truncate text-base ${
                        task.isCompleted ? 'line-through' : ''
                      }`}
                    >
                      {task.title}
                    </div>
                    <div className="mt-2 flex items-center gap-2">
                      <Badge
                        className={getPriorityBadgeVariant(task.priority)}
                      >
                        {TASK_PRIORITY_LABELS[task.priority]}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {new Date(task.createdAt).toLocaleString('zh-CN', {
                          month: '2-digit',
                          day: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <Button
                      size="icon"
                      variant={task.isCompleted ? 'secondary' : 'outline'}
                      onClick={() => handleToggleComplete(task)}
                      aria-label={task.isCompleted ? '标记为未完成' : '标记为已完成'}
                      disabled={updateMutation.isPending}
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="destructive"
                      onClick={() => handleDelete(task.id)}
                      aria-label="删除任务"
                      disabled={deleteMutation.isPending}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TasksPage;
