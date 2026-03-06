import {
    IsString,
    IsOptional,
    IsIn,
    IsUUID,
    IsInt,
    Min,
    IsDateString,
    IsArray,
    MinLength,
    IsObject,
} from 'class-validator';

export class CreateTaskDto {
    @IsString()
    @MinLength(1)
    title: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsOptional()
    @IsIn(['todo', 'in_progress', 'review', 'done'])
    status?: string;

    @IsOptional()
    @IsIn(['low', 'medium', 'high', 'urgent'])
    priority?: string;

    @IsOptional()
    @IsDateString()
    dueDate?: string;

    @IsOptional()
    @IsUUID()
    assigneeId?: string;

    @IsOptional()
    @IsUUID()
    parentId?: string;

    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    tags?: string[];

    @IsOptional()
    @IsObject()
    recurringRule?: Record<string, any>;
}

export class UpdateTaskDto {
    @IsOptional()
    @IsString()
    @MinLength(1)
    title?: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsOptional()
    @IsIn(['todo', 'in_progress', 'review', 'done'])
    status?: string;

    @IsOptional()
    @IsIn(['low', 'medium', 'high', 'urgent'])
    priority?: string;

    @IsOptional()
    @IsDateString()
    dueDate?: string;

    @IsOptional()
    @IsUUID()
    assigneeId?: string;

    @IsOptional()
    @IsInt()
    @Min(0)
    position?: number;
}

export class ReorderTaskDto {
    @IsUUID()
    taskId: string;

    @IsInt()
    @Min(0)
    newPosition: number;

    @IsOptional()
    @IsIn(['todo', 'in_progress', 'review', 'done'])
    newStatus?: string;
}
