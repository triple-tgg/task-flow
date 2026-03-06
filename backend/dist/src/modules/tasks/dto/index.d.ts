export declare class CreateTaskDto {
    title: string;
    description?: string;
    status?: string;
    priority?: string;
    dueDate?: string;
    assigneeId?: string;
    parentId?: string;
    tags?: string[];
    recurringRule?: Record<string, any>;
}
export declare class UpdateTaskDto {
    title?: string;
    description?: string;
    status?: string;
    priority?: string;
    dueDate?: string;
    assigneeId?: string;
    position?: number;
}
export declare class ReorderTaskDto {
    taskId: string;
    newPosition: number;
    newStatus?: string;
}
