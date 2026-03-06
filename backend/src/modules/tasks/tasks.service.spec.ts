import { Test, TestingModule } from '@nestjs/testing';
import { TasksService } from './tasks.service';
import { PrismaService } from '../../prisma/prisma.service';
import { NotFoundException, ForbiddenException } from '@nestjs/common';

describe('TasksService', () => {
    let service: TasksService;

    const mockTask = {
        id: 'task-1',
        projectId: 'proj-1',
        title: 'Test Task',
        description: 'A test task',
        status: 'todo',
        priority: 'medium',
        position: 0,
        creatorId: 'user-1',
        assigneeId: null,
        parentId: null,
        dueDate: null,
        recurringRule: null,
        deletedAt: null,
        deletedBy: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        creator: { id: 'user-1', name: 'Test User', email: 'test@example.com' },
        assignee: null,
        tags: [],
        subTasks: [],
        _count: { comments: 0, attachments: 0 },
    };

    const mockPrisma = {
        task: {
            create: jest.fn(),
            findMany: jest.fn(),
            findUnique: jest.fn(),
            update: jest.fn(),
            updateMany: jest.fn(),
            count: jest.fn(),
            aggregate: jest.fn(),
        },
        projectMember: {
            findUnique: jest.fn(),
        },
        tag: {
            findUnique: jest.fn(),
            create: jest.fn(),
        },
        taskTag: {
            deleteMany: jest.fn(),
            create: jest.fn(),
        },
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                TasksService,
                { provide: PrismaService, useValue: mockPrisma },
            ],
        }).compile();

        service = module.get<TasksService>(TasksService);
        jest.clearAllMocks();
    });

    // Helper to set up membership mock
    const mockMembership = (role = 'owner') => {
        mockPrisma.projectMember.findUnique.mockResolvedValue({
            projectId: 'proj-1',
            userId: 'user-1',
            role,
        });
    };

    describe('create', () => {
        it('should create a task with correct position', async () => {
            mockMembership('owner');
            mockPrisma.task.aggregate.mockResolvedValue({ _max: { position: 2 } });
            mockPrisma.task.create.mockResolvedValue(mockTask);
            mockPrisma.task.findUnique.mockResolvedValue(mockTask);

            const result = await service.create('proj-1', 'user-1', {
                title: 'Test Task',
            });

            expect(result.title).toBe('Test Task');
            expect(mockPrisma.task.create).toHaveBeenCalledWith(
                expect.objectContaining({
                    data: expect.objectContaining({
                        position: 3,
                        status: 'todo',
                        priority: 'medium',
                    }),
                }),
            );
        });

        it('should throw ForbiddenException for viewer role', async () => {
            mockMembership('viewer');

            await expect(
                service.create('proj-1', 'user-1', { title: 'Task' }),
            ).rejects.toThrow(ForbiddenException);
        });

        it('should throw ForbiddenException for non-member', async () => {
            mockPrisma.projectMember.findUnique.mockResolvedValue(null);

            await expect(
                service.create('proj-1', 'user-1', { title: 'Task' }),
            ).rejects.toThrow(ForbiddenException);
        });
    });

    describe('findByProject', () => {
        it('should return paginated tasks', async () => {
            mockMembership('viewer');
            mockPrisma.task.findMany.mockResolvedValue([mockTask]);
            mockPrisma.task.count.mockResolvedValue(1);

            const result = await service.findByProject('proj-1', 'user-1');

            expect(result.data).toHaveLength(1);
            expect(result.meta.total).toBe(1);
            expect(result.meta.page).toBe(1);
        });

        it('should apply status filter', async () => {
            mockMembership('viewer');
            mockPrisma.task.findMany.mockResolvedValue([]);
            mockPrisma.task.count.mockResolvedValue(0);

            await service.findByProject('proj-1', 'user-1', { status: 'done' });

            expect(mockPrisma.task.findMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: expect.objectContaining({ status: 'done' }),
                }),
            );
        });
    });

    describe('getBoard', () => {
        it('should group tasks by status', async () => {
            mockMembership('viewer');
            const todoTask = { ...mockTask, status: 'todo' };
            const doneTask = { ...mockTask, id: 'task-2', status: 'done' };
            mockPrisma.task.findMany.mockResolvedValue([todoTask, doneTask]);

            const result = await service.getBoard('proj-1', 'user-1');

            expect(result.todo).toHaveLength(1);
            expect(result.done).toHaveLength(1);
            expect(result.in_progress).toHaveLength(0);
            expect(result.review).toHaveLength(0);
        });
    });

    describe('findById', () => {
        it('should return a task when it exists', async () => {
            mockPrisma.task.findUnique.mockResolvedValue(mockTask);
            mockMembership('viewer');

            const result = await service.findById('task-1', 'user-1');

            expect(result.id).toBe('task-1');
        });

        it('should throw NotFoundException when task not found', async () => {
            mockPrisma.task.findUnique.mockResolvedValue(null);

            await expect(
                service.findById('non-existent', 'user-1'),
            ).rejects.toThrow(NotFoundException);
        });
    });

    describe('update', () => {
        it('should update task data', async () => {
            mockPrisma.task.findUnique.mockResolvedValue(mockTask);
            mockMembership('editor');
            mockPrisma.task.update.mockResolvedValue({
                ...mockTask,
                title: 'Updated Title',
            });

            const result = await service.update('task-1', 'user-1', {
                title: 'Updated Title',
            });

            expect(result.title).toBe('Updated Title');
        });

        it('should throw ForbiddenException for viewer', async () => {
            mockPrisma.task.findUnique.mockResolvedValue(mockTask);
            mockMembership('viewer');

            await expect(
                service.update('task-1', 'user-1', { title: 'X' }),
            ).rejects.toThrow(ForbiddenException);
        });
    });

    describe('remove', () => {
        it('should soft-delete a task', async () => {
            mockPrisma.task.findUnique.mockResolvedValue(mockTask);
            mockMembership('owner');
            mockPrisma.task.update.mockResolvedValue({});

            const result = await service.remove('task-1', 'user-1');

            expect(result.message).toBe('Task deleted');
            expect(mockPrisma.task.update).toHaveBeenCalledWith(
                expect.objectContaining({
                    data: expect.objectContaining({
                        deletedAt: expect.any(Date),
                        deletedBy: 'user-1',
                    }),
                }),
            );
        });
    });

    describe('reorder', () => {
        it('should reorder within the same column', async () => {
            mockMembership('editor');
            mockPrisma.task.findUnique.mockResolvedValue({
                ...mockTask,
                position: 0,
                status: 'todo',
            });
            mockPrisma.task.updateMany.mockResolvedValue({ count: 1 });
            mockPrisma.task.update.mockResolvedValue({
                ...mockTask,
                position: 2,
            });

            const result = await service.reorder('proj-1', 'user-1', 'task-1', 2);

            expect(mockPrisma.task.update).toHaveBeenCalledWith(
                expect.objectContaining({
                    data: expect.objectContaining({ position: 2, status: 'todo' }),
                }),
            );
        });

        it('should handle cross-column reorder', async () => {
            mockMembership('editor');
            mockPrisma.task.findUnique.mockResolvedValue({
                ...mockTask,
                position: 1,
                status: 'todo',
            });
            mockPrisma.task.updateMany.mockResolvedValue({ count: 1 });
            mockPrisma.task.update.mockResolvedValue({
                ...mockTask,
                position: 0,
                status: 'in_progress',
            });

            await service.reorder('proj-1', 'user-1', 'task-1', 0, 'in_progress');

            // Should have called updateMany twice (old column shift + new column shift)
            expect(mockPrisma.task.updateMany).toHaveBeenCalledTimes(2);
        });
    });
});
