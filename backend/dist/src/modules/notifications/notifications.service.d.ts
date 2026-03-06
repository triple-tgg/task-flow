import { PrismaService } from '../../prisma/prisma.service';
export declare class NotificationsService {
    private prisma;
    constructor(prisma: PrismaService);
    create(userId: string, type: string, payload: Record<string, any>): Promise<{
        id: string;
        createdAt: Date;
        userId: string;
        type: string;
        payload: import("@prisma/client/runtime/client").JsonValue;
        isRead: boolean;
    }>;
    findByUser(userId: string, page?: number, limit?: number): Promise<{
        data: {
            id: string;
            createdAt: Date;
            userId: string;
            type: string;
            payload: import("@prisma/client/runtime/client").JsonValue;
            isRead: boolean;
        }[];
        unreadCount: number;
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    markRead(notificationId: string, userId: string): Promise<{
        message: string;
    }>;
    markAllRead(userId: string): Promise<{
        message: string;
    }>;
}
