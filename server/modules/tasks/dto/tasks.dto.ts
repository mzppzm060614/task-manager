import { IsBoolean, IsIn, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { TASK_PRIORITIES, type CreateTaskRequest, type UpdateTaskRequest } from '@shared/api.interface';

export class CreateTaskDto implements CreateTaskRequest {
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  title!: string;

  @IsIn(TASK_PRIORITIES)
  priority!: 'high' | 'medium' | 'low';
}

export class UpdateTaskDto implements UpdateTaskRequest {
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  title?: string;

  @IsOptional()
  @IsIn(TASK_PRIORITIES)
  priority?: 'high' | 'medium' | 'low';

  @IsOptional()
  @IsBoolean()
  isCompleted?: boolean;
}
