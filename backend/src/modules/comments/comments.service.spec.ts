import { Test, TestingModule } from '@nestjs/testing';
import { CommentsService } from './comments.service';
import { PrismaService } from '../../prisma/prisma.service';
import { NotFoundException, ForbiddenException } from '@nestjs/common';

describe('CommentsService', () => {
    let service: CommentsService;

    const mockTask = {
        id: 'task-1',
        projectId: 'proj-1',
        deletedAt: null,
    };

    const mockComment = {
        id: 'comment-1',
        taskId: 'task-1',
        userId: 'user-1',
        content: 'Test comment',
        deletedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        user: { id: 'user-1', name: 'Test User', email: 'test@example.com' },
    };

    const mockPrisma = {
        task: {
            findUnique: jest.fn(),
        },
        comment: {
            create: jest.fn(),
            findMany: jest.fn(),
            findUnique: jest.fn(),
            update: jest.fn(),
            count: jest.fn(),
        },
        projectMember: {
            findUnique: jest.fn(),
        },
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                CommentsService,
                { provide: PrismaService, useValue: mockPrisma },
            ],
        }).compile();

        service = module.get<CommentsService>(CommentsService);
        jest.clearAllMocks();
    });

    const mockMembership = () => {
        mockPrisma.projectMember.findUnique.mockResolvedValue({
            projectId: 'proj-1',
            userId: 'user-1',
            role: 'editor',
        });
    };

    describe('create', () => {
        it('should create a comment on a valid task', async () => {
            mockPrisma.task.findUnique.mockResolvedValue(mockTask);
            mockMembership();
            mockPrisma.comment.create.mockResolvedValue(mockComment);

            const result = await service.create('task-1', 'user-1', 'Test comment');

            expect(result.content).toBe('Test comment');
            expect(mockPrisma.comment.create).toHaveBeenCalledWith(
                expect.objectContaining({
                    data: { taskId: 'task-1', userId: 'user-1', content: 'Test comment' },
                }),
            );
        });

        it('should throw NotFoundException for non-existent task', async () => {
            mockPrisma.task.findUnique.mockResolvedValue(null);

            await expect(
                service.create('non-existent', 'user-1', 'Comment'),
            ).rejects.toThrow(NotFoundException);
        });

        it('should throw ForbiddenException for non-member', async () => {
            mockPrisma.task.findUnique.mockResolvedValue(mockTask);
            mockPrisma.projectMember.findUnique.mockResolvedValue(null);

            await expect(
                service.create('task-1', 'user-2', 'Comment'),
            ).rejects.toThrow(ForbiddenException);
        });
    });

    describe('findByTask', () => {
        it('should return paginated comments', async () => {
            mockPrisma.task.findUnique.mockResolvedValue(mockTask);
            mockMembership();
            mockPrisma.comment.findMany.mockResolvedValue([mockComment]);
            mockPrisma.comment.count.mockResolvedValue(1);

            const result = await service.findByTask('task-1', 'user-1');

            expect(result.data).toHaveLength(1);
            expect(result.meta.total).toBe(1);
            expect(result.meta.page).toBe(1);
        });

        it('should throw NotFoundException for non-existent task', async () => {
            mockPrisma.task.findUnique.mockResolvedValue(null);

            await expect(
                service.findByTask('non-existent', 'user-1'),
            ).rejects.toThrow(NotFoundException);
        });
    });

    describe('update', () => {
        it('should update own comment', async () => {
            mockPrisma.comment.findUnique.mockResolvedValue(mockComment);
            mockPrisma.comment.update.mockResolvedValue({
                ...mockComment,
                content: 'Updated comment',
            });

            const result = await service.update('comment-1', 'user-1', 'Updated comment');

            expect(result.content).toBe('Updated comment');
        });

        it('should throw NotFoundException for non-existent comment', async () => {
            mockPrisma.comment.findUnique.mockResolvedValue(null);

            await expect(
                service.update('non-existent', 'user-1', 'Updated'),
            ).rejects.toThrow(NotFoundException);
        });

        it('should throw ForbiddenException when updating another user\'s comment', async () => {
            mockPrisma.comment.findUnique.mockResolvedValue(mockComment);

            await expect(
                service.update('comment-1', 'user-2', 'Hacked'),
            ).rejects.toThrow(ForbiddenException);
        });
    });

    describe('remove', () => {
        it('should soft-delete own comment', async () => {
            mockPrisma.comment.findUnique.mockResolvedValue(mockComment);
            mockPrisma.comment.update.mockResolvedValue({});

            const result = await service.remove('comment-1', 'user-1');

            expect(result.message).toBe('Comment deleted');
            expect(mockPrisma.comment.update).toHaveBeenCalledWith(
                expect.objectContaining({
                    data: { deletedAt: expect.any(Date) },
                }),
            );
        });

        it('should throw ForbiddenException when deleting another user\'s comment', async () => {
            mockPrisma.comment.findUnique.mockResolvedValue(mockComment);

            await expect(
                service.remove('comment-1', 'user-2'),
            ).rejects.toThrow(ForbiddenException);
        });
    });
});
