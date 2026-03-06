import { Test, TestingModule } from '@nestjs/testing';
import { AnalyticsService } from './analytics.service';
import { PrismaService } from '../../prisma/prisma.service';

describe('AnalyticsService', () => {
    let service: AnalyticsService;

    const mockPrisma = {
        projectMember: {
            findMany: jest.fn(),
        },
        project: {
            count: jest.fn(),
        },
        task: {
            count: jest.fn(),
            groupBy: jest.fn(),
            findMany: jest.fn(),
        },
        activityLog: {
            findMany: jest.fn(),
        },
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AnalyticsService,
                { provide: PrismaService, useValue: mockPrisma },
            ],
        }).compile();

        service = module.get<AnalyticsService>(AnalyticsService);
        jest.clearAllMocks();
    });

    describe('getDashboardStats', () => {
        it('should return empty stats for users with no projects', async () => {
            mockPrisma.projectMember.findMany.mockResolvedValue([]);

            const result = await service.getDashboardStats('user-1');

            expect(result.overview.totalProjects).toBe(0);
            expect(result.overview.totalTasks).toBe(0);
            expect(result.overview.completionRate).toBe(0);
        });

        it('should return aggregated stats for user with projects', async () => {
            mockPrisma.projectMember.findMany.mockResolvedValue([
                { projectId: 'proj-1', role: 'owner' },
                { projectId: 'proj-2', role: 'editor' },
            ]);
            mockPrisma.project.count.mockResolvedValue(2);
            mockPrisma.task.count
                .mockResolvedValueOnce(10) // totalTasks
                .mockResolvedValueOnce(3)  // myAssignedTasks
                .mockResolvedValueOnce(1); // overdueTasks
            mockPrisma.task.groupBy
                .mockResolvedValueOnce([  // by status
                    { status: 'todo', _count: { id: 3 } },
                    { status: 'in_progress', _count: { id: 2 } },
                    { status: 'done', _count: { id: 5 } },
                ])
                .mockResolvedValueOnce([  // by priority
                    { priority: 'low', _count: { id: 2 } },
                    { priority: 'medium', _count: { id: 5 } },
                    { priority: 'high', _count: { id: 3 } },
                ]);
            mockPrisma.task.findMany.mockResolvedValue([]);  // recentTasks
            mockPrisma.activityLog.findMany.mockResolvedValue([]);  // recentActivity

            const result = await service.getDashboardStats('user-1');

            expect(result.overview.totalProjects).toBe(2);
            expect(result.overview.totalTasks).toBe(10);
            expect(result.overview.completionRate).toBe(50); // 5 done out of 10
            expect(result.overview.overdueTasks).toBe(1);
            expect(result.tasksByStatus.done).toBe(5);
            expect(result.tasksByPriority.medium).toBe(5);
        });
    });

    describe('getCompletionTrend', () => {
        it('should return 30 days of data', async () => {
            mockPrisma.projectMember.findMany.mockResolvedValue([
                { projectId: 'proj-1' },
            ]);
            mockPrisma.task.findMany
                .mockResolvedValueOnce([]) // completedTasks
                .mockResolvedValueOnce([]); // createdTasks

            const result = await service.getCompletionTrend('user-1');

            expect(result).toHaveLength(30);
            expect(result[0]).toHaveProperty('date');
            expect(result[0]).toHaveProperty('created');
            expect(result[0]).toHaveProperty('completed');
        });
    });
});
