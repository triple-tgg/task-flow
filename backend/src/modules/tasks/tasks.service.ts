import {
    Injectable,
    NotFoundException,
    ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class TasksService {
    constructor(private prisma: PrismaService) { }

    // ─── Create ──────────────────────────────────────────

    async create(
        projectId: string,
        userId: string,
        data: {
            title: string;
            description?: string;
            status?: string;
            priority?: string;
            dueDate?: string;
            assigneeId?: string;
            parentId?: string;
            tags?: string[];
            recurringRule?: Record<string, any>;
        },
    ) {
        await this.verifyProjectAccess(projectId, userId, ['owner', 'editor']);

        // Get max position in this status column
        const maxPosition = await this.prisma.task.aggregate({
            where: {
                projectId,
                status: data.status || 'todo',
                deletedAt: null,
            },
            _max: { position: true },
        });

        const task = await this.prisma.task.create({
            data: {
                projectId,
                creatorId: userId,
                title: data.title,
                description: data.description,
                status: data.status || 'todo',
                priority: data.priority || 'medium',
                dueDate: data.dueDate ? new Date(data.dueDate) : null,
                assigneeId: data.assigneeId,
                parentId: data.parentId,
                recurringRule: data.recurringRule || undefined,
                position: (maxPosition._max.position ?? -1) + 1,
            },
            include: this.taskIncludes(),
        });

        // Handle tags
        if (data.tags?.length) {
            await this.syncTags(projectId, task.id, data.tags);
        }

        return this.findByIdInternal(task.id);
    }

    // ─── Find All in Project ─────────────────────────────

    async findByProject(
        projectId: string,
        userId: string,
        filters?: {
            status?: string;
            priority?: string;
            assigneeId?: string;
            search?: string;
            page?: number;
            limit?: number;
        },
    ) {
        await this.verifyProjectAccess(projectId, userId, ['owner', 'editor', 'viewer']);

        const page = filters?.page || 1;
        const limit = filters?.limit || 50;
        const skip = (page - 1) * limit;

        const where: any = {
            projectId,
            deletedAt: null,
            parentId: null, // Only top-level tasks
        };

        if (filters?.status) where.status = filters.status;
        if (filters?.priority) where.priority = filters.priority;
        if (filters?.assigneeId) where.assigneeId = filters.assigneeId;
        if (filters?.search) {
            where.OR = [
                { title: { contains: filters.search, mode: 'insensitive' } },
                { description: { contains: filters.search, mode: 'insensitive' } },
            ];
        }

        const [tasks, total] = await Promise.all([
            this.prisma.task.findMany({
                where,
                skip,
                take: limit,
                include: this.taskIncludes(),
                orderBy: [{ position: 'asc' }, { createdAt: 'desc' }],
            }),
            this.prisma.task.count({ where }),
        ]);

        return {
            data: tasks,
            meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
        };
    }

    // ─── Kanban Board View ───────────────────────────────

    async getBoard(projectId: string, userId: string) {
        await this.verifyProjectAccess(projectId, userId, ['owner', 'editor', 'viewer']);

        const tasks = await this.prisma.task.findMany({
            where: { projectId, deletedAt: null, parentId: null },
            include: this.taskIncludes(),
            orderBy: { position: 'asc' },
        });

        // Group by status
        const board: Record<string, typeof tasks> = {
            todo: [],
            in_progress: [],
            review: [],
            done: [],
        };

        for (const task of tasks) {
            if (board[task.status]) {
                board[task.status].push(task);
            }
        }

        return board;
    }

    // ─── Find One ────────────────────────────────────────

    async findById(taskId: string, userId: string) {
        const task = await this.findByIdInternal(taskId);
        await this.verifyProjectAccess(task.projectId, userId, ['owner', 'editor', 'viewer']);
        return task;
    }

    // ─── Update ──────────────────────────────────────────

    async update(
        taskId: string,
        userId: string,
        data: {
            title?: string;
            description?: string;
            status?: string;
            priority?: string;
            dueDate?: string;
            assigneeId?: string;
            position?: number;
        },
    ) {
        const task = await this.findByIdInternal(taskId);
        await this.verifyProjectAccess(task.projectId, userId, ['owner', 'editor']);

        const updateData: any = { ...data };
        if (data.dueDate) updateData.dueDate = new Date(data.dueDate);

        return this.prisma.task.update({
            where: { id: taskId },
            data: updateData,
            include: this.taskIncludes(),
        });
    }

    // ─── Reorder (Kanban drag-and-drop) ──────────────────

    async reorder(
        projectId: string,
        userId: string,
        taskId: string,
        newPosition: number,
        newStatus?: string,
    ) {
        await this.verifyProjectAccess(projectId, userId, ['owner', 'editor']);

        const task = await this.findByIdInternal(taskId);
        const targetStatus = newStatus || task.status;

        // If status changed, update positions in both columns
        if (targetStatus !== task.status) {
            // Shift positions in old column
            await this.prisma.task.updateMany({
                where: {
                    projectId,
                    status: task.status,
                    position: { gt: task.position },
                    deletedAt: null,
                },
                data: { position: { decrement: 1 } },
            });
            // Shift positions in new column
            await this.prisma.task.updateMany({
                where: {
                    projectId,
                    status: targetStatus,
                    position: { gte: newPosition },
                    deletedAt: null,
                },
                data: { position: { increment: 1 } },
            });
        } else {
            // Same column reorder
            if (newPosition > task.position) {
                await this.prisma.task.updateMany({
                    where: {
                        projectId,
                        status: targetStatus,
                        position: { gt: task.position, lte: newPosition },
                        deletedAt: null,
                        id: { not: taskId },
                    },
                    data: { position: { decrement: 1 } },
                });
            } else if (newPosition < task.position) {
                await this.prisma.task.updateMany({
                    where: {
                        projectId,
                        status: targetStatus,
                        position: { gte: newPosition, lt: task.position },
                        deletedAt: null,
                        id: { not: taskId },
                    },
                    data: { position: { increment: 1 } },
                });
            }
        }

        return this.prisma.task.update({
            where: { id: taskId },
            data: { position: newPosition, status: targetStatus },
            include: this.taskIncludes(),
        });
    }

    // ─── Soft Delete ─────────────────────────────────────

    async remove(taskId: string, userId: string) {
        const task = await this.findByIdInternal(taskId);
        await this.verifyProjectAccess(task.projectId, userId, ['owner', 'editor']);

        await this.prisma.task.update({
            where: { id: taskId },
            data: { deletedAt: new Date(), deletedBy: userId },
        });

        return { message: 'Task deleted' };
    }

    // ─── Tag Management ──────────────────────────────────

    async updateTags(taskId: string, userId: string, tagNames: string[]) {
        const task = await this.findByIdInternal(taskId);
        await this.verifyProjectAccess(task.projectId, userId, ['owner', 'editor']);
        await this.syncTags(task.projectId, taskId, tagNames);
        return this.findByIdInternal(taskId);
    }

    // ─── Private Helpers ─────────────────────────────────

    private async findByIdInternal(taskId: string) {
        const task = await this.prisma.task.findUnique({
            where: { id: taskId, deletedAt: null },
            include: this.taskIncludes(),
        });
        if (!task) {
            throw new NotFoundException({
                error: 'TASK_NOT_FOUND',
                message: 'Task not found',
            });
        }
        return task;
    }

    // ─── Assignees ────────────────────────────────────────

    async addAssignee(taskId: string, userId: string, targetUserId: string) {
        const task = await this.findByIdInternal(taskId);
        await this.verifyProjectAccess(task.projectId, userId, ['owner', 'editor']);

        // Verify target user is a project member
        const isMember = await this.prisma.projectMember.findFirst({
            where: { projectId: task.projectId, userId: targetUserId },
        });
        if (!isMember) {
            throw new ForbiddenException({ error: 'NOT_MEMBER', message: 'User is not a project member' });
        }

        await this.prisma.taskAssignee.upsert({
            where: { taskId_userId: { taskId, userId: targetUserId } },
            create: { taskId, userId: targetUserId },
            update: {},
        });

        return this.prisma.task.findUnique({
            where: { id: taskId },
            include: this.taskIncludes(),
        });
    }

    async removeAssignee(taskId: string, userId: string, targetUserId: string) {
        const task = await this.findByIdInternal(taskId);
        await this.verifyProjectAccess(task.projectId, userId, ['owner', 'editor']);

        await this.prisma.taskAssignee.deleteMany({
            where: { taskId, userId: targetUserId },
        });

        return this.prisma.task.findUnique({
            where: { id: taskId },
            include: this.taskIncludes(),
        });
    }

    private taskIncludes() {
        return {
            creator: { select: { id: true, name: true, email: true } },
            assignee: { select: { id: true, name: true, email: true } },
            assignees: {
                include: { user: { select: { id: true, name: true, email: true } } },
                orderBy: { createdAt: 'asc' as const },
            },
            tags: {
                include: { tag: { select: { id: true, name: true, color: true } } },
            },
            subTasks: {
                where: { deletedAt: null },
                select: {
                    id: true,
                    title: true,
                    status: true,
                    priority: true,
                    assigneeId: true,
                },
                orderBy: { position: 'asc' as const },
            },
            _count: { select: { comments: true, attachments: true } },
        };
    }

    private async syncTags(projectId: string, taskId: string, tagNames: string[]) {
        // Delete existing task-tag links
        await this.prisma.taskTag.deleteMany({ where: { taskId } });

        if (!tagNames.length) return;

        // Upsert tags for this project
        for (const name of tagNames) {
            let tag = await this.prisma.tag.findUnique({
                where: { projectId_name: { projectId, name } },
            });
            if (!tag) {
                tag = await this.prisma.tag.create({
                    data: { projectId, name },
                });
            }
            await this.prisma.taskTag.create({
                data: { taskId, tagId: tag.id },
            });
        }
    }

    private async verifyProjectAccess(projectId: string, userId: string, roles: string[]) {
        const membership = await this.prisma.projectMember.findUnique({
            where: { projectId_userId: { projectId, userId } },
        });
        if (!membership) {
            throw new ForbiddenException({
                error: 'NOT_A_MEMBER',
                message: 'You are not a member of this project',
            });
        }
        if (!roles.includes(membership.role)) {
            throw new ForbiddenException({
                error: 'INSUFFICIENT_ROLE',
                message: `This action requires one of: ${roles.join(', ')}`,
            });
        }
    }
}
