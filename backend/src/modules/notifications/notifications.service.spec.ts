import { Test, TestingModule } from '@nestjs/testing';
import { NotificationsService } from './notifications.service';
import { PrismaService } from '../../prisma/prisma.service';

describe('NotificationsService', () => {
    let service: NotificationsService;

    const mockNotification = {
        id: 'notif-1',
        userId: 'user-1',
        type: 'task.assigned',
        payload: { taskId: 'task-1', taskTitle: 'Test Task' },
        isRead: false,
        createdAt: new Date(),
    };

    const mockPrisma = {
        notification: {
            create: jest.fn(),
            findMany: jest.fn(),
            count: jest.fn(),
            updateMany: jest.fn(),
        },
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                NotificationsService,
                { provide: PrismaService, useValue: mockPrisma },
            ],
        }).compile();

        service = module.get<NotificationsService>(NotificationsService);
        jest.clearAllMocks();
    });

    describe('create', () => {
        it('should create a notification', async () => {
            mockPrisma.notification.create.mockResolvedValue(mockNotification);

            const result = await service.create('user-1', 'task.assigned', {
                taskId: 'task-1',
                taskTitle: 'Test Task',
            });

            expect(result.type).toBe('task.assigned');
            expect(mockPrisma.notification.create).toHaveBeenCalledWith({
                data: {
                    userId: 'user-1',
                    type: 'task.assigned',
                    payload: { taskId: 'task-1', taskTitle: 'Test Task' },
                },
            });
        });
    });

    describe('findByUser', () => {
        it('should return paginated notifications with unread count', async () => {
            mockPrisma.notification.findMany.mockResolvedValue([mockNotification]);
            mockPrisma.notification.count
                .mockResolvedValueOnce(1)  // total
                .mockResolvedValueOnce(1); // unreadCount

            const result = await service.findByUser('user-1');

            expect(result.data).toHaveLength(1);
            expect(result.unreadCount).toBe(1);
            expect(result.meta.total).toBe(1);
            expect(result.meta.page).toBe(1);
        });

        it('should paginate correctly', async () => {
            mockPrisma.notification.findMany.mockResolvedValue([]);
            mockPrisma.notification.count
                .mockResolvedValueOnce(50)
                .mockResolvedValueOnce(10);

            const result = await service.findByUser('user-1', 2, 20);

            expect(result.meta.page).toBe(2);
            expect(result.meta.totalPages).toBe(3);
            expect(mockPrisma.notification.findMany).toHaveBeenCalledWith(
                expect.objectContaining({ skip: 20, take: 20 }),
            );
        });
    });

    describe('markRead', () => {
        it('should mark a single notification as read', async () => {
            mockPrisma.notification.updateMany.mockResolvedValue({ count: 1 });

            const result = await service.markRead('notif-1', 'user-1');

            expect(result.message).toBe('Notification marked as read');
            expect(mockPrisma.notification.updateMany).toHaveBeenCalledWith({
                where: { id: 'notif-1', userId: 'user-1' },
                data: { isRead: true },
            });
        });
    });

    describe('markAllRead', () => {
        it('should mark all unread notifications as read', async () => {
            mockPrisma.notification.updateMany.mockResolvedValue({ count: 5 });

            const result = await service.markAllRead('user-1');

            expect(result.message).toBe('All notifications marked as read');
            expect(mockPrisma.notification.updateMany).toHaveBeenCalledWith({
                where: { userId: 'user-1', isRead: false },
                data: { isRead: true },
            });
        });
    });
});
