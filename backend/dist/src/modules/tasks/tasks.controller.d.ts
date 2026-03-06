import { TasksService } from './tasks.service';
import { CreateTaskDto, UpdateTaskDto, ReorderTaskDto } from './dto';
export declare class TasksController {
    private readonly tasksService;
    constructor(tasksService: TasksService);
    create(projectId: string, userId: string, dto: CreateTaskDto): Promise<{
        _count: {
            comments: number;
            attachments: number;
        };
        tags: ({
            tag: {
                id: string;
                name: string;
                color: string | null;
            };
        } & {
            taskId: string;
            tagId: string;
        })[];
        creator: {
            id: string;
            email: string;
            name: string;
        };
        assignee: {
            id: string;
            email: string;
            name: string;
        } | null;
        subTasks: {
            id: string;
            title: string;
            status: string;
            priority: string;
            assigneeId: string | null;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        description: string | null;
        title: string;
        projectId: string;
        position: number;
        status: string;
        priority: string;
        dueDate: Date | null;
        recurringRule: import(".prisma/client/runtime/client").JsonValue | null;
        deletedBy: string | null;
        creatorId: string;
        assigneeId: string | null;
        parentId: string | null;
    }>;
    findAll(projectId: string, userId: string, status?: string, priority?: string, assigneeId?: string, search?: string, page?: string, limit?: string): Promise<{
        data: ({
            _count: {
                comments: number;
                attachments: number;
            };
            tags: ({
                tag: {
                    id: string;
                    name: string;
                    color: string | null;
                };
            } & {
                taskId: string;
                tagId: string;
            })[];
            creator: {
                id: string;
                email: string;
                name: string;
            };
            assignee: {
                id: string;
                email: string;
                name: string;
            } | null;
            subTasks: {
                id: string;
                title: string;
                status: string;
                priority: string;
                assigneeId: string | null;
            }[];
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date | null;
            description: string | null;
            title: string;
            projectId: string;
            position: number;
            status: string;
            priority: string;
            dueDate: Date | null;
            recurringRule: import(".prisma/client/runtime/client").JsonValue | null;
            deletedBy: string | null;
            creatorId: string;
            assigneeId: string | null;
            parentId: string | null;
        })[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    getBoard(projectId: string, userId: string): Promise<Record<string, ({
        _count: {
            comments: number;
            attachments: number;
        };
        tags: ({
            tag: {
                id: string;
                name: string;
                color: string | null;
            };
        } & {
            taskId: string;
            tagId: string;
        })[];
        creator: {
            id: string;
            email: string;
            name: string;
        };
        assignee: {
            id: string;
            email: string;
            name: string;
        } | null;
        subTasks: {
            id: string;
            title: string;
            status: string;
            priority: string;
            assigneeId: string | null;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        description: string | null;
        title: string;
        projectId: string;
        position: number;
        status: string;
        priority: string;
        dueDate: Date | null;
        recurringRule: import(".prisma/client/runtime/client").JsonValue | null;
        deletedBy: string | null;
        creatorId: string;
        assigneeId: string | null;
        parentId: string | null;
    })[]>>;
    findOne(taskId: string, userId: string): Promise<{
        _count: {
            comments: number;
            attachments: number;
        };
        tags: ({
            tag: {
                id: string;
                name: string;
                color: string | null;
            };
        } & {
            taskId: string;
            tagId: string;
        })[];
        creator: {
            id: string;
            email: string;
            name: string;
        };
        assignee: {
            id: string;
            email: string;
            name: string;
        } | null;
        subTasks: {
            id: string;
            title: string;
            status: string;
            priority: string;
            assigneeId: string | null;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        description: string | null;
        title: string;
        projectId: string;
        position: number;
        status: string;
        priority: string;
        dueDate: Date | null;
        recurringRule: import(".prisma/client/runtime/client").JsonValue | null;
        deletedBy: string | null;
        creatorId: string;
        assigneeId: string | null;
        parentId: string | null;
    }>;
    update(taskId: string, userId: string, dto: UpdateTaskDto): Promise<{
        _count: {
            comments: number;
            attachments: number;
        };
        tags: ({
            tag: {
                id: string;
                name: string;
                color: string | null;
            };
        } & {
            taskId: string;
            tagId: string;
        })[];
        creator: {
            id: string;
            email: string;
            name: string;
        };
        assignee: {
            id: string;
            email: string;
            name: string;
        } | null;
        subTasks: {
            id: string;
            title: string;
            status: string;
            priority: string;
            assigneeId: string | null;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        description: string | null;
        title: string;
        projectId: string;
        position: number;
        status: string;
        priority: string;
        dueDate: Date | null;
        recurringRule: import(".prisma/client/runtime/client").JsonValue | null;
        deletedBy: string | null;
        creatorId: string;
        assigneeId: string | null;
        parentId: string | null;
    }>;
    reorder(projectId: string, userId: string, dto: ReorderTaskDto): Promise<{
        _count: {
            comments: number;
            attachments: number;
        };
        tags: ({
            tag: {
                id: string;
                name: string;
                color: string | null;
            };
        } & {
            taskId: string;
            tagId: string;
        })[];
        creator: {
            id: string;
            email: string;
            name: string;
        };
        assignee: {
            id: string;
            email: string;
            name: string;
        } | null;
        subTasks: {
            id: string;
            title: string;
            status: string;
            priority: string;
            assigneeId: string | null;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        description: string | null;
        title: string;
        projectId: string;
        position: number;
        status: string;
        priority: string;
        dueDate: Date | null;
        recurringRule: import(".prisma/client/runtime/client").JsonValue | null;
        deletedBy: string | null;
        creatorId: string;
        assigneeId: string | null;
        parentId: string | null;
    }>;
    updateTags(taskId: string, userId: string, tags: string[]): Promise<{
        _count: {
            comments: number;
            attachments: number;
        };
        tags: ({
            tag: {
                id: string;
                name: string;
                color: string | null;
            };
        } & {
            taskId: string;
            tagId: string;
        })[];
        creator: {
            id: string;
            email: string;
            name: string;
        };
        assignee: {
            id: string;
            email: string;
            name: string;
        } | null;
        subTasks: {
            id: string;
            title: string;
            status: string;
            priority: string;
            assigneeId: string | null;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        description: string | null;
        title: string;
        projectId: string;
        position: number;
        status: string;
        priority: string;
        dueDate: Date | null;
        recurringRule: import(".prisma/client/runtime/client").JsonValue | null;
        deletedBy: string | null;
        creatorId: string;
        assigneeId: string | null;
        parentId: string | null;
    }>;
    remove(taskId: string, userId: string): Promise<{
        message: string;
    }>;
}
