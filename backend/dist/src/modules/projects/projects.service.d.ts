import { PrismaService } from '../../prisma/prisma.service';
export declare class ProjectsService {
    private prisma;
    constructor(prisma: PrismaService);
    create(userId: string, data: {
        name: string;
        description?: string;
    }): Promise<{
        members: {
            userId: string;
            role: string;
        }[];
        id: string;
        name: string;
        description: string | null;
        isPublic: boolean;
        shareToken: string | null;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
    }>;
    findByUser(userId: string, page?: number, limit?: number): Promise<{
        data: {
            myRole: string;
            taskStats: {
                total: number;
                done: number;
                overdue: number;
            };
            id: string;
            name: string;
            description: string | null;
            createdAt: Date;
            updatedAt: Date;
            _count: {
                members: number;
                tasks: number;
            };
        }[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    findById(projectId: string, userId: string): Promise<{
        myRole: string;
        members: ({
            user: {
                id: string;
                name: string;
                email: string;
            };
        } & {
            id: string;
            projectId: string;
            userId: string;
            role: string;
            joinedAt: Date;
        })[];
        _count: {
            tasks: number;
        };
        id: string;
        name: string;
        description: string | null;
        isPublic: boolean;
        shareToken: string | null;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
    }>;
    update(projectId: string, userId: string, data: {
        name?: string;
        description?: string;
    }): Promise<{
        id: string;
        name: string;
        description: string | null;
        updatedAt: Date;
    }>;
    remove(projectId: string, userId: string): Promise<{
        message: string;
    }>;
    addMember(projectId: string, requesterId: string, targetUserId: string, role?: string): Promise<{
        user: {
            id: string;
            name: string;
            email: string;
        };
    } & {
        id: string;
        projectId: string;
        userId: string;
        role: string;
        joinedAt: Date;
    }>;
    updateMemberRole(projectId: string, requesterId: string, targetUserId: string, role: string): Promise<{
        user: {
            id: string;
            name: string;
            email: string;
        };
    } & {
        id: string;
        projectId: string;
        userId: string;
        role: string;
        joinedAt: Date;
    }>;
    removeMember(projectId: string, requesterId: string, targetUserId: string): Promise<{
        message: string;
    }>;
    generateShareLink(projectId: string, userId: string): Promise<{
        id: string;
        isPublic: boolean;
        shareToken: string | null;
    }>;
    revokeShareLink(projectId: string, userId: string): Promise<{
        message: string;
    }>;
    findByShareToken(token: string): Promise<{
        project: {
            id: string;
            name: string;
            description: string | null;
            createdAt: Date;
            members: {
                user: {
                    id: string;
                    name: string;
                };
                role: string;
            }[];
        };
        board: {
            todo: ({
                tags: ({
                    tag: {
                        id: string;
                        name: string;
                        createdAt: Date;
                        projectId: string;
                        color: string | null;
                    };
                } & {
                    taskId: string;
                    tagId: string;
                })[];
                assignee: {
                    id: string;
                    name: string;
                } | null;
            } & {
                id: string;
                description: string | null;
                createdAt: Date;
                updatedAt: Date;
                deletedAt: Date | null;
                projectId: string;
                title: string;
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
            in_progress: ({
                tags: ({
                    tag: {
                        id: string;
                        name: string;
                        createdAt: Date;
                        projectId: string;
                        color: string | null;
                    };
                } & {
                    taskId: string;
                    tagId: string;
                })[];
                assignee: {
                    id: string;
                    name: string;
                } | null;
            } & {
                id: string;
                description: string | null;
                createdAt: Date;
                updatedAt: Date;
                deletedAt: Date | null;
                projectId: string;
                title: string;
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
            review: ({
                tags: ({
                    tag: {
                        id: string;
                        name: string;
                        createdAt: Date;
                        projectId: string;
                        color: string | null;
                    };
                } & {
                    taskId: string;
                    tagId: string;
                })[];
                assignee: {
                    id: string;
                    name: string;
                } | null;
            } & {
                id: string;
                description: string | null;
                createdAt: Date;
                updatedAt: Date;
                deletedAt: Date | null;
                projectId: string;
                title: string;
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
            done: ({
                tags: ({
                    tag: {
                        id: string;
                        name: string;
                        createdAt: Date;
                        projectId: string;
                        color: string | null;
                    };
                } & {
                    taskId: string;
                    tagId: string;
                })[];
                assignee: {
                    id: string;
                    name: string;
                } | null;
            } & {
                id: string;
                description: string | null;
                createdAt: Date;
                updatedAt: Date;
                deletedAt: Date | null;
                projectId: string;
                title: string;
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
        };
    }>;
    private getMembership;
    private requireRole;
}
