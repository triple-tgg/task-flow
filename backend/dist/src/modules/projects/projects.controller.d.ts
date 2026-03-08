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
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        description: string | null;
        isPublic: boolean;
        shareToken: string | null;
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
            createdAt: Date;
            updatedAt: Date;
            _count: {
                members: number;
                tasks: number;
            };
            description: string | null;
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
        _count: {
            tasks: number;
        };
        members: ({
            user: {
                id: string;
                email: string;
                name: string;
            };
        } & {
            id: string;
            role: string;
            userId: string;
            projectId: string;
            joinedAt: Date;
        })[];
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        description: string | null;
        isPublic: boolean;
        shareToken: string | null;
    }>;
    update(id: string, userId: string, dto: UpdateProjectDto): Promise<{
        id: string;
        name: string;
        updatedAt: Date;
        description: string | null;
    }>;
    remove(id: string, userId: string): Promise<{
        message: string;
    }>;
    addMember(projectId: string, requesterId: string, dto: AddMemberDto): Promise<{
        user: {
            id: string;
            email: string;
            name: string;
        };
    } & {
        id: string;
        role: string;
        userId: string;
        projectId: string;
        joinedAt: Date;
    }>;
    updateMemberRole(projectId: string, targetUserId: string, requesterId: string, dto: UpdateMemberRoleDto): Promise<{
        user: {
            id: string;
            email: string;
            name: string;
        };
    } & {
        id: string;
        role: string;
        userId: string;
        projectId: string;
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
            createdAt: Date;
            description: string | null;
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
                createdAt: Date;
                updatedAt: Date;
                deletedAt: Date | null;
                description: string | null;
                title: string;
                projectId: string;
                parentId: string | null;
                status: string;
                priority: string;
                dueDate: Date | null;
                position: number;
                recurringRule: import(".prisma/client/runtime/client").JsonValue | null;
                creatorId: string;
                assigneeId: string | null;
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
                createdAt: Date;
                updatedAt: Date;
                deletedAt: Date | null;
                description: string | null;
                title: string;
                projectId: string;
                parentId: string | null;
                status: string;
                priority: string;
                dueDate: Date | null;
                position: number;
                recurringRule: import(".prisma/client/runtime/client").JsonValue | null;
                creatorId: string;
                assigneeId: string | null;
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
                createdAt: Date;
                updatedAt: Date;
                deletedAt: Date | null;
                description: string | null;
                title: string;
                projectId: string;
                parentId: string | null;
                status: string;
                priority: string;
                dueDate: Date | null;
                position: number;
                recurringRule: import(".prisma/client/runtime/client").JsonValue | null;
                creatorId: string;
                assigneeId: string | null;
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
                createdAt: Date;
                updatedAt: Date;
                deletedAt: Date | null;
                description: string | null;
                title: string;
                projectId: string;
                parentId: string | null;
                status: string;
                priority: string;
                dueDate: Date | null;
                position: number;
                recurringRule: import(".prisma/client/runtime/client").JsonValue | null;
                creatorId: string;
                assigneeId: string | null;
                deletedBy: string | null;
            })[];
        };
    }>;
}
