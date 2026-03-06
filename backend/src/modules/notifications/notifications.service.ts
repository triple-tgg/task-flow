import {
    Injectable,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class NotificationsService {
    constructor(private prisma: PrismaService) { }

    async create(userId: string, type: string, payload: Record<string, any>) {
        return this.prisma.notification.create({
            data: { userId, type, payload },
        });
    }

    async findByUser(userId: string, page = 1, limit = 30) {
        const skip = (page - 1) * limit;
        const [notifications, total, unreadCount] = await Promise.all([
            this.prisma.notification.findMany({
                where: { userId },
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
            }),
            this.prisma.notification.count({ where: { userId } }),
            this.prisma.notification.count({ where: { userId, isRead: false } }),
        ]);

        return {
            data: notifications,
            unreadCount,
            meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
        };
    }

    async markRead(notificationId: string, userId: string) {
        await this.prisma.notification.updateMany({
            where: { id: notificationId, userId },
            data: { isRead: true },
        });
        return { message: 'Notification marked as read' };
    }

    async markAllRead(userId: string) {
        await this.prisma.notification.updateMany({
            where: { userId, isRead: false },
            data: { isRead: true },
        });
        return { message: 'All notifications marked as read' };
    }
}
