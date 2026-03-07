import { PrismaService } from '../../prisma/prisma.service';
export declare class TasksService {
    private prisma;
    constructor(prisma: PrismaService);
    create(projectId: string, userId: string, data: {
        title: string;
        description?: string;
        status?: string;
        priority?: string;
        dueDate?: string;
        assigneeId?: string;
        parentId?: string;
        tags?: string[];
        recurringRule?: Record<string, any>;
    }): Promise<{
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
        status: string;
        priority: string;
        dueDate: Date | null;
        position: number;
        recurringRule: import(".prisma/client/runtime/client").JsonValue | null;
        creatorId: string;
        assigneeId: string | null;
        parentId: string | null;
        deletedBy: string | null;
    }>;
    findByProject(projectId: string, userId: string, filters?: {
        status?: string;
        priority?: string;
        assigneeId?: string;
        search?: string;
        page?: number;
        limit?: number;
    }): Promise<{
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
            status: string;
            priority: string;
            dueDate: Date | null;
            position: number;
            recurringRule: import(".prisma/client/runtime/client").JsonValue | null;
            creatorId: string;
            assigneeId: string | null;
            parentId: string | null;
            deletedBy: string | null;
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
        status: string;
        priority: string;
        dueDate: Date | null;
        position: number;
        recurringRule: import(".prisma/client/runtime/client").JsonValue | null;
        creatorId: string;
        assigneeId: string | null;
        parentId: string | null;
        deletedBy: string | null;
    })[]>>;
    findById(taskId: string, userId: string): Promise<{
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
        status: string;
        priority: string;
        dueDate: Date | null;
        position: number;
        recurringRule: import(".prisma/client/runtime/client").JsonValue | null;
        creatorId: string;
        assigneeId: string | null;
        parentId: string | null;
        deletedBy: string | null;
    }>;
    update(taskId: string, userId: string, data: {
        title?: string;
        description?: string;
        status?: string;
        priority?: string;
        dueDate?: string;
        assigneeId?: string;
        position?: number;
    }): Promise<{
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
        status: string;
        priority: string;
        dueDate: Date | null;
        position: number;
        recurringRule: import(".prisma/client/runtime/client").JsonValue | null;
        creatorId: string;
        assigneeId: string | null;
        parentId: string | null;
        deletedBy: string | null;
    }>;
    reorder(projectId: string, userId: string, taskId: string, newPosition: number, newStatus?: string): Promise<{
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
        status: string;
        priority: string;
        dueDate: Date | null;
        position: number;
        recurringRule: import(".prisma/client/runtime/client").JsonValue | null;
        creatorId: string;
        assigneeId: string | null;
        parentId: string | null;
        deletedBy: string | null;
    }>;
    remove(taskId: string, userId: string): Promise<{
        message: string;
    }>;
    updateTags(taskId: string, userId: string, tagNames: string[]): Promise<{
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
        status: string;
        priority: string;
        dueDate: Date | null;
        position: number;
        recurringRule: import(".prisma/client/runtime/client").JsonValue | null;
        creatorId: string;
        assigneeId: string | null;
        parentId: string | null;
        deletedBy: string | null;
    }>;
    private findByIdInternal;
    private taskIncludes;
    private syncTags;
    private verifyProjectAccess;
}
