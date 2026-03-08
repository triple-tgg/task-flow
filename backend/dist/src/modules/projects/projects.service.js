"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProjectsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const crypto = __importStar(require("crypto"));
let ProjectsService = class ProjectsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(userId, data) {
        return this.prisma.$transaction(async (tx) => {
            const project = await tx.project.create({
                data: {
                    name: data.name,
                    description: data.description,
                },
            });
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
    async findByUser(userId, page = 1, limit = 20) {
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
    async findById(projectId, userId) {
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
            throw new common_1.NotFoundException({
                error: 'PROJECT_NOT_FOUND',
                message: 'Project not found',
            });
        }
        return { ...project, myRole: membership.role };
    }
    async update(projectId, userId, data) {
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
    async remove(projectId, userId) {
        await this.requireRole(projectId, userId, ['owner']);
        await this.prisma.project.update({
            where: { id: projectId },
            data: { deletedAt: new Date() },
        });
        return { message: 'Project deleted' };
    }
    async addMember(projectId, requesterId, targetUserId, role = 'editor') {
        await this.requireRole(projectId, requesterId, ['owner']);
        const existing = await this.prisma.projectMember.findUnique({
            where: { projectId_userId: { projectId, userId: targetUserId } },
        });
        if (existing) {
            throw new common_1.ConflictException({
                error: 'MEMBER_EXISTS',
                message: 'User is already a member of this project',
            });
        }
        const targetUser = await this.prisma.user.findUnique({
            where: { id: targetUserId },
        });
        if (!targetUser) {
            throw new common_1.NotFoundException({
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
    async updateMemberRole(projectId, requesterId, targetUserId, role) {
        await this.requireRole(projectId, requesterId, ['owner']);
        if (requesterId === targetUserId) {
            throw new common_1.ForbiddenException({
                error: 'FORBIDDEN',
                message: 'Cannot change your own role',
            });
        }
        const membership = await this.prisma.projectMember.findUnique({
            where: { projectId_userId: { projectId, userId: targetUserId } },
        });
        if (!membership) {
            throw new common_1.NotFoundException({
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
    async removeMember(projectId, requesterId, targetUserId) {
        await this.requireRole(projectId, requesterId, ['owner']);
        if (requesterId === targetUserId) {
            throw new common_1.ForbiddenException({
                error: 'FORBIDDEN',
                message: 'Cannot remove yourself. Transfer ownership first.',
            });
        }
        const membership = await this.prisma.projectMember.findUnique({
            where: { projectId_userId: { projectId, userId: targetUserId } },
        });
        if (!membership) {
            throw new common_1.NotFoundException({
                error: 'MEMBER_NOT_FOUND',
                message: 'Member not found in this project',
            });
        }
        await this.prisma.projectMember.delete({
            where: { projectId_userId: { projectId, userId: targetUserId } },
        });
        return { message: 'Member removed' };
    }
    async generateShareLink(projectId, userId) {
        await this.requireRole(projectId, userId, ['owner']);
        const token = crypto.randomUUID();
        const project = await this.prisma.project.update({
            where: { id: projectId },
            data: { isPublic: true, shareToken: token },
            select: { id: true, shareToken: true, isPublic: true },
        });
        return project;
    }
    async revokeShareLink(projectId, userId) {
        await this.requireRole(projectId, userId, ['owner']);
        await this.prisma.project.update({
            where: { id: projectId },
            data: { isPublic: false, shareToken: null },
        });
        return { message: 'Share link revoked' };
    }
    async findByShareToken(token) {
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
            throw new common_1.NotFoundException({
                error: 'PROJECT_NOT_FOUND',
                message: 'Shared project not found or link has been revoked',
            });
        }
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
    async getMembership(projectId, userId) {
        const membership = await this.prisma.projectMember.findUnique({
            where: { projectId_userId: { projectId, userId } },
        });
        if (!membership) {
            throw new common_1.ForbiddenException({
                error: 'NOT_A_MEMBER',
                message: 'You are not a member of this project',
            });
        }
        return membership;
    }
    async requireRole(projectId, userId, roles) {
        const membership = await this.getMembership(projectId, userId);
        if (!roles.includes(membership.role)) {
            throw new common_1.ForbiddenException({
                error: 'INSUFFICIENT_ROLE',
                message: `This action requires one of: ${roles.join(', ')}`,
            });
        }
        return membership;
    }
};
exports.ProjectsService = ProjectsService;
exports.ProjectsService = ProjectsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ProjectsService);
//# sourceMappingURL=projects.service.js.map