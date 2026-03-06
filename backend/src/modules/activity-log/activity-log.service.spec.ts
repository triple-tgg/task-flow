import { Test, TestingModule } from '@nestjs/testing';
import { ActivityLogService } from './activity-log.service';
import { PrismaService } from '../../prisma/prisma.service';

describe('ActivityLogService', () => {
    let service: ActivityLogService;

    const mockPrisma = {
        activityLog: {
            create: jest.fn(),
            findMany: jest.fn(),
            count: jest.fn(),
            deleteMany: jest.fn(),
        },
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ActivityLogService,
                { provide: PrismaService, useValue: mockPrisma },
            ],
        }).compile();

        service = module.get<ActivityLogService>(ActivityLogService);
        jest.clearAllMocks();
    });

    describe('log', () => {
        it('should create an activity log entry', async () => {
            mockPrisma.activityLog.create.mockResolvedValue({
                id: 'log-1',
                userId: 'user-1',
                action: 'task.created',
                entityType: 'task',
                entityId: 'task-1',
            });

            const result = await service.log({
                userId: 'user-1',
                projectId: 'proj-1',
                action: 'task.created',
                entityType: 'task',
                entityId: 'task-1',
                metadata: { title: 'New Task' },
            });

            expect(result.action).toBe('task.created');
            expect(mockPrisma.activityLog.create).toHaveBeenCalledWith({
                data: expect.objectContaining({
                    userId: 'user-1',
                    projectId: 'proj-1',
                    action: 'task.created',
                }),
            });
        });
    });

    describe('getByProject', () => {
        it('should return paginated activity logs', async () => {
            mockPrisma.activityLog.findMany.mockResolvedValue([
                { id: 'log-1', action: 'task.created' },
            ]);
            mockPrisma.activityLog.count.mockResolvedValue(1);

            const result = await service.getByProject('proj-1', 1, 30);

            expect(result.data).toHaveLength(1);
            expect(result.meta.total).toBe(1);
            expect(result.meta.page).toBe(1);
        });
    });

    describe('purgeOldLogs', () => {
        it('should delete logs older than specified days', async () => {
            mockPrisma.activityLog.deleteMany.mockResolvedValue({ count: 42 });

            const result = await service.purgeOldLogs(90);

            expect(result.deleted).toBe(42);
            expect(mockPrisma.activityLog.deleteMany).toHaveBeenCalledWith({
                where: {
                    createdAt: { lt: expect.any(Date) },
                },
            });
        });
    });
});
