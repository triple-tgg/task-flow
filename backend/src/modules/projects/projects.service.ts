import {
    Injectable,
    NotFoundException,
    ForbiddenException,
    ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import * as crypto from 'crypto';

@Injectable()
export class ProjectsService {
    constructor(private prisma: PrismaService) { }

    // ─── Create ──────────────────────────────────────────

    async create(userId: string, data: { name: string; description?: string }) {
        return this.prisma.$transaction(async (tx) => {
            const project = await tx.project.create({
                data: {
                    name: data.name,
                    description: data.description,
                },
            });

            // Creator becomes owner
            await tx.projectMember.create({
                data: {
                    projectId: project.id,
                    userId,
                    role: 'owner',
                },
            });

            return {
                ...project,
                members: [{ userId, role: 'owner' }],
            };
        });
    }

    // ─── Find All (user's projects) ──────────────────────

    async findByUser(userId: string, page = 1, limit = 20) {
        const skip = (page - 1) * limit;

        const [memberships, total] = await Promise.all([
            this.prisma.projectMember.findMany({
                where: { userId, project: { deletedAt: null } },
                skip,
                take: limit,
                include: {
                    project: {
                        select: {
                            id: true,
                            name: true,
                            description: true,
                            createdAt: true,
                            updatedAt: true,
                            _count: { select: { tasks: { where: { deletedAt: null } }, members: true } },
                        },
                    },
                },
                orderBy: { project: { updatedAt: 'desc' } },
            }),
            this.prisma.projectMember.count({
                where: { userId, project: { deletedAt: null } },
            }),
        ]);

        // Fetch done and overdue counts for each project
        const projectIds = memberships.map((m) => m.project.id);
        const now = new Date();

        const [doneCounts, overdueCounts] = await Promise.all([
            this.prisma.task.groupBy({
                by: ['projectId'],
                where: { projectId: { in: projectIds }, status: 'done', deletedAt: null },
                _count: true,
            }),
            this.prisma.task.groupBy({
                by: ['projectId'],
                where: {
                    projectId: { in: projectIds },
                    dueDate: { lt: now },
                    status: { not: 'done' },
                    deletedAt: null,
                },
                _count: true,
            }),
        ]);

        const doneMap = new Map(doneCounts.map((d) => [d.projectId, d._count]));
        const overdueMap = new Map(overdueCounts.map((d) => [d.projectId, d._count]));

        return {
            data: memberships.map((m) => ({
                ...m.project,
                myRole: m.role,
                taskStats: {
                    total: m.project._count.tasks,
                    done: doneMap.get(m.project.id) || 0,
                    overdue: overdueMap.get(m.project.id) || 0,
                },
            })),
            meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
        };
    }

    // ─── Find One ────────────────────────────────────────

    async findById(projectId: string, userId: string) {
        const membership = await this.getMembership(projectId, userId);

        const project = await this.prisma.project.findUnique({
            where: { id: projectId, deletedAt: null },
            include: {
                members: {
                    include: {
                        user: {
                            select: { id: true, name: true, email: true },
                        },
                    },
                },
                _count: { select: { tasks: true } },
            },
        });

        if (!project) {
            throw new NotFoundException({
                error: 'PROJECT_NOT_FOUND',
                message: 'Project not found',
            });
        }

        return { ...project, myRole: membership.role };
    }

    // ─── Update ──────────────────────────────────────────

    async update(projectId: string, userId: string, data: { name?: string; description?: string }) {
        await this.requireRole(projectId, userId, ['owner', 'editor']);

        return this.prisma.project.update({
            where: { id: projectId },
            data,
            select: {
                id: true,
                name: true,
                description: true,
                updatedAt: true,
            },
        });
    }

    // ─── Soft Delete ─────────────────────────────────────

    async remove(projectId: string, userId: string) {
        await this.requireRole(projectId, userId, ['owner']);

        await this.prisma.project.update({
            where: { id: projectId },
            data: { deletedAt: new Date() },
        });

        return { message: 'Project deleted' };
    }

    // ─── Members ─────────────────────────────────────────

    async addMember(projectId: string, requesterId: string, targetUserId: string, role = 'editor') {
        await this.requireRole(projectId, requesterId, ['owner']);

        // Check if user already a member
        const existing = await this.prisma.projectMember.findUnique({
            where: { projectId_userId: { projectId, userId: targetUserId } },
        });
        if (existing) {
            throw new ConflictException({
                error: 'MEMBER_EXISTS',
                message: 'User is already a member of this project',
            });
        }

        // Verify target user exists
        const targetUser = await this.prisma.user.findUnique({
            where: { id: targetUserId },
        });
        if (!targetUser) {
            throw new NotFoundException({
                error: 'USER_NOT_FOUND',
                message: 'User not found',
            });
        }

        return this.prisma.projectMember.create({
            data: { projectId, userId: targetUserId, role },
            include: {
                user: { select: { id: true, name: true, email: true } },
            },
        });
    }

    async updateMemberRole(projectId: string, requesterId: string, targetUserId: string, role: string) {
        await this.requireRole(projectId, requesterId, ['owner']);

        // Can't change own role
        if (requesterId === targetUserId) {
            throw new ForbiddenException({
                error: 'FORBIDDEN',
                message: 'Cannot change your own role',
            });
        }

        const membership = await this.prisma.projectMember.findUnique({
            where: { projectId_userId: { projectId, userId: targetUserId } },
        });
        if (!membership) {
            throw new NotFoundException({
                error: 'MEMBER_NOT_FOUND',
                message: 'Member not found in this project',
            });
        }

        return this.prisma.projectMember.update({
            where: { projectId_userId: { projectId, userId: targetUserId } },
            data: { role },
            include: {
                user: { select: { id: true, name: true, email: true } },
            },
        });
    }

    async removeMember(projectId: string, requesterId: string, targetUserId: string) {
        await this.requireRole(projectId, requesterId, ['owner']);

        if (requesterId === targetUserId) {
            throw new ForbiddenException({
                error: 'FORBIDDEN',
                message: 'Cannot remove yourself. Transfer ownership first.',
            });
        }

        const membership = await this.prisma.projectMember.findUnique({
            where: { projectId_userId: { projectId, userId: targetUserId } },
        });
        if (!membership) {
            throw new NotFoundException({
                error: 'MEMBER_NOT_FOUND',
                message: 'Member not found in this project',
            });
        }

        await this.prisma.projectMember.delete({
            where: { projectId_userId: { projectId, userId: targetUserId } },
        });

        return { message: 'Member removed' };
    }

    // ─── Share Link ─────────────────────────────────────

    async generateShareLink(projectId: string, userId: string) {
        await this.requireRole(projectId, userId, ['owner']);

        const token = crypto.randomUUID();

        const project = await this.prisma.project.update({
            where: { id: projectId },
            data: { isPublic: true, shareToken: token },
            select: { id: true, shareToken: true, isPublic: true },
        });

        return project;
    }

    async revokeShareLink(projectId: string, userId: string) {
        await this.requireRole(projectId, userId, ['owner']);

        await this.prisma.project.update({
            where: { id: projectId },
            data: { isPublic: false, shareToken: null },
        });

        return { message: 'Share link revoked' };
    }

    async findByShareToken(token: string) {
        const project = await this.prisma.project.findUnique({
            where: { shareToken: token, isPublic: true, deletedAt: null },
            select: {
                id: true,
                name: true,
                description: true,
                createdAt: true,
                members: {
                    select: {
                        role: true,
                        user: { select: { id: true, name: true } },
                    },
                },
            },
        });

        if (!project) {
            throw new NotFoundException({
                error: 'PROJECT_NOT_FOUND',
                message: 'Shared project not found or link has been revoked',
            });
        }

        // Fetch tasks grouped by status (kanban board)
        const tasks = await this.prisma.task.findMany({
            where: { projectId: project.id, deletedAt: null },
            include: {
                assignee: { select: { id: true, name: true } },
                tags: { include: { tag: true } },
            },
            orderBy: { position: 'asc' },
        });

        const board = {
            todo: tasks.filter((t) => t.status === 'todo'),
            in_progress: tasks.filter((t) => t.status === 'in_progress'),
            review: tasks.filter((t) => t.status === 'review'),
            done: tasks.filter((t) => t.status === 'done'),
        };

        return { project, board };
    }

    // ─── Helpers ─────────────────────────────────────────

    private async getMembership(projectId: string, userId: string) {
        const membership = await this.prisma.projectMember.findUnique({
            where: { projectId_userId: { projectId, userId } },
        });
        if (!membership) {
            throw new ForbiddenException({
                error: 'NOT_A_MEMBER',
                message: 'You are not a member of this project',
            });
        }
        return membership;
    }

    private async requireRole(projectId: string, userId: string, roles: string[]) {
        const membership = await this.getMembership(projectId, userId);
        if (!roles.includes(membership.role)) {
            throw new ForbiddenException({
                error: 'INSUFFICIENT_ROLE',
                message: `This action requires one of: ${roles.join(', ')}`,
            });
        }
        return membership;
    }
}
