import {
    Injectable,
    NotFoundException,
    ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class CommentsService {
    constructor(private prisma: PrismaService) { }

    async create(taskId: string, userId: string, content: string) {
        // Verify task exists and user has access
        const task = await this.prisma.task.findUnique({
            where: { id: taskId, deletedAt: null },
        });
        if (!task) {
            throw new NotFoundException({ error: 'TASK_NOT_FOUND', message: 'Task not found' });
        }

        await this.verifyProjectAccess(task.projectId, userId);

        return this.prisma.comment.create({
            data: { taskId, userId, content },
            include: {
                user: { select: { id: true, name: true, email: true } },
            },
        });
    }

    async findByTask(taskId: string, userId: string, page = 1, limit = 30) {
        const task = await this.prisma.task.findUnique({
            where: { id: taskId, deletedAt: null },
        });
        if (!task) {
            throw new NotFoundException({ error: 'TASK_NOT_FOUND', message: 'Task not found' });
        }
        await this.verifyProjectAccess(task.projectId, userId);

        const skip = (page - 1) * limit;
        const [comments, total] = await Promise.all([
            this.prisma.comment.findMany({
                where: { taskId, deletedAt: null },
                skip,
                take: limit,
                include: {
                    user: { select: { id: true, name: true, email: true } },
                },
                orderBy: { createdAt: 'desc' },
            }),
            this.prisma.comment.count({ where: { taskId, deletedAt: null } }),
        ]);

        return {
            data: comments,
            meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
        };
    }

    async update(commentId: string, userId: string, content: string) {
        const comment = await this.prisma.comment.findUnique({
            where: { id: commentId, deletedAt: null },
        });
        if (!comment) {
            throw new NotFoundException({ error: 'COMMENT_NOT_FOUND', message: 'Comment not found' });
        }
        if (comment.userId !== userId) {
            throw new ForbiddenException({ error: 'FORBIDDEN', message: 'You can only edit your own comments' });
        }

        return this.prisma.comment.update({
            where: { id: commentId },
            data: { content },
            include: {
                user: { select: { id: true, name: true, email: true } },
            },
        });
    }

    async remove(commentId: string, userId: string) {
        const comment = await this.prisma.comment.findUnique({
            where: { id: commentId, deletedAt: null },
        });
        if (!comment) {
            throw new NotFoundException({ error: 'COMMENT_NOT_FOUND', message: 'Comment not found' });
        }
        if (comment.userId !== userId) {
            throw new ForbiddenException({ error: 'FORBIDDEN', message: 'You can only delete your own comments' });
        }

        await this.prisma.comment.update({
            where: { id: commentId },
            data: { deletedAt: new Date() },
        });

        return { message: 'Comment deleted' };
    }

    private async verifyProjectAccess(projectId: string, userId: string) {
        const membership = await this.prisma.projectMember.findUnique({
            where: { projectId_userId: { projectId, userId } },
        });
        if (!membership) {
            throw new ForbiddenException({ error: 'NOT_A_MEMBER', message: 'You are not a member of this project' });
        }
    }
}
