import { NotificationsService } from './notifications.service';
export declare class NotificationsController {
    private readonly notificationsService;
    constructor(notificationsService: NotificationsService);
    findAll(userId: string, page?: string, limit?: string): Promise<{
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
    markRead(id: string, userId: string): Promise<{
        message: string;
    }>;
    markAllRead(userId: string): Promise<{
        message: string;
    }>;
}
