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
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        description: string | null;
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
    findById(projectId: string, userId: string): Promise<{
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
    }>;
    update(projectId: string, userId: string, data: {
        name?: string;
        description?: string;
    }): Promise<{
        id: string;
        name: string;
        updatedAt: Date;
        description: string | null;
    }>;
    remove(projectId: string, userId: string): Promise<{
        message: string;
    }>;
    addMember(projectId: string, requesterId: string, targetUserId: string, role?: string): Promise<{
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
    updateMemberRole(projectId: string, requesterId: string, targetUserId: string, role: string): Promise<{
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
    removeMember(projectId: string, requesterId: string, targetUserId: string): Promise<{
        message: string;
    }>;
    private getMembership;
    private requireRole;
}
