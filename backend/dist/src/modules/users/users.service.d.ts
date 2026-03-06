import { PrismaService } from '../../prisma/prisma.service';
export declare class UsersService {
    private prisma;
    constructor(prisma: PrismaService);
    findById(id: string): Promise<{
        id: string;
        email: string;
        name: string;
        emailVerified: boolean;
        role: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    updateProfile(userId: string, data: {
        name?: string;
    }): Promise<{
        id: string;
        email: string;
        name: string;
        role: string;
    }>;
    changePassword(userId: string, currentPassword: string, newPassword: string): Promise<{
        message: string;
    }>;
    findAll(page?: number, limit?: number): Promise<{
        data: {
            id: string;
            email: string;
            name: string;
            emailVerified: boolean;
            role: string;
            isSuspended: boolean;
            createdAt: Date;
        }[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    toggleSuspension(userId: string, isSuspended: boolean): Promise<{
        message: string;
    }>;
}
