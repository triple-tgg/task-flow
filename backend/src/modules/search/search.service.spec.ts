import { Test, TestingModule } from '@nestjs/testing';
import { SearchService } from './search.service';
import { PrismaService } from '../../prisma/prisma.service';

describe('SearchService', () => {
    let service: SearchService;

    const mockPrisma = {
        projectMember: {
            findMany: jest.fn(),
        },
        task: {
            findMany: jest.fn(),
        },
        project: {
            findMany: jest.fn(),
        },
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                SearchService,
                { provide: PrismaService, useValue: mockPrisma },
            ],
        }).compile();

        service = module.get<SearchService>(SearchService);
        jest.clearAllMocks();
    });

    describe('globalSearch', () => {
        it('should return empty results for short queries', async () => {
            const result = await service.globalSearch('user-1', 'a');

            expect(result).toEqual({ tasks: [], projects: [] });
            expect(mockPrisma.projectMember.findMany).not.toHaveBeenCalled();
        });

        it('should return empty results for empty query', async () => {
            const result = await service.globalSearch('user-1', '');

            expect(result).toEqual({ tasks: [], projects: [] });
        });

        it('should return empty results for users with no projects', async () => {
            mockPrisma.projectMember.findMany.mockResolvedValue([]);

            const result = await service.globalSearch('user-1', 'test query');

            expect(result).toEqual({ tasks: [], projects: [] });
        });

        it('should search tasks and projects within user memberships', async () => {
            mockPrisma.projectMember.findMany.mockResolvedValue([
                { projectId: 'proj-1' },
                { projectId: 'proj-2' },
            ]);
            mockPrisma.task.findMany.mockResolvedValue([
                {
                    id: 'task-1',
                    title: 'Test task',
                    status: 'todo',
                    priority: 'medium',
                    projectId: 'proj-1',
                    project: { name: 'Project 1' },
                    assignee: null,
                    createdAt: new Date(),
                },
            ]);
            mockPrisma.project.findMany.mockResolvedValue([
                {
                    id: 'proj-1',
                    name: 'Test Project',
                    description: 'A test project',
                    _count: { tasks: 3, members: 2 },
                },
            ]);

            const result = await service.globalSearch('user-1', 'test');

            expect(result.tasks).toHaveLength(1);
            expect(result.projects).toHaveLength(1);
            expect(mockPrisma.task.findMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: expect.objectContaining({
                        projectId: { in: ['proj-1', 'proj-2'] },
                        deletedAt: null,
                    }),
                }),
            );
        });

        it('should respect the limit parameter', async () => {
            mockPrisma.projectMember.findMany.mockResolvedValue([
                { projectId: 'proj-1' },
            ]);
            mockPrisma.task.findMany.mockResolvedValue([]);
            mockPrisma.project.findMany.mockResolvedValue([]);

            await service.globalSearch('user-1', 'test', 5);

            expect(mockPrisma.task.findMany).toHaveBeenCalledWith(
                expect.objectContaining({ take: 5 }),
            );
            expect(mockPrisma.project.findMany).toHaveBeenCalledWith(
                expect.objectContaining({ take: 5 }),
            );
        });
    });
});
