import { ProjectsService } from './projects.service';
import { CreateProjectDto, UpdateProjectDto, AddMemberDto, UpdateMemberRoleDto } from './dto';
export declare class ProjectsController {
    private readonly projectsService;
    constructor(projectsService: ProjectsService);
    create(userId: string, dto: CreateProjectDto): Promise<{
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
    findAll(userId: string, page?: string, limit?: string): Promise<{
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
    findOne(id: string, userId: string): Promise<{
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
    update(id: string, userId: string, dto: UpdateProjectDto): Promise<{
        id: string;
        name: string;
        description: string | null;
        updatedAt: Date;
    }>;
    remove(id: string, userId: string): Promise<{
        message: string;
    }>;
    addMember(projectId: string, requesterId: string, dto: AddMemberDto): Promise<{
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
    updateMemberRole(projectId: string, targetUserId: string, requesterId: string, dto: UpdateMemberRoleDto): Promise<{
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
    removeMember(projectId: string, targetUserId: string, requesterId: string): Promise<{
        message: string;
    }>;
    enableShare(projectId: string, userId: string): Promise<{
        id: string;
        isPublic: boolean;
        shareToken: string | null;
    }>;
    revokeShare(projectId: string, userId: string): Promise<{
        message: string;
    }>;
    viewPublic(token: string): Promise<{
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
}
