"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommentsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let CommentsService = class CommentsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(taskId, userId, content) {
        const task = await this.prisma.task.findUnique({
            where: { id: taskId, deletedAt: null },
        });
        if (!task) {
            throw new common_1.NotFoundException({ error: 'TASK_NOT_FOUND', message: 'Task not found' });
        }
        await this.verifyProjectAccess(task.projectId, userId);
        return this.prisma.comment.create({
            data: { taskId, userId, content },
            include: {
                user: { select: { id: true, name: true, email: true } },
            },
        });
    }
    async findByTask(taskId, userId, page = 1, limit = 30) {
        const task = await this.prisma.task.findUnique({
            where: { id: taskId, deletedAt: null },
        });
        if (!task) {
            throw new common_1.NotFoundException({ error: 'TASK_NOT_FOUND', message: 'Task not found' });
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
    async update(commentId, userId, content) {
        const comment = await this.prisma.comment.findUnique({
            where: { id: commentId, deletedAt: null },
        });
        if (!comment) {
            throw new common_1.NotFoundException({ error: 'COMMENT_NOT_FOUND', message: 'Comment not found' });
        }
        if (comment.userId !== userId) {
            throw new common_1.ForbiddenException({ error: 'FORBIDDEN', message: 'You can only edit your own comments' });
        }
        return this.prisma.comment.update({
            where: { id: commentId },
            data: { content },
            include: {
                user: { select: { id: true, name: true, email: true } },
            },
        });
    }
    async remove(commentId, userId) {
        const comment = await this.prisma.comment.findUnique({
            where: { id: commentId, deletedAt: null },
        });
        if (!comment) {
            throw new common_1.NotFoundException({ error: 'COMMENT_NOT_FOUND', message: 'Comment not found' });
        }
        if (comment.userId !== userId) {
            throw new common_1.ForbiddenException({ error: 'FORBIDDEN', message: 'You can only delete your own comments' });
        }
        await this.prisma.comment.update({
            where: { id: commentId },
            data: { deletedAt: new Date() },
        });
        return { message: 'Comment deleted' };
    }
    async verifyProjectAccess(projectId, userId) {
        const membership = await this.prisma.projectMember.findUnique({
            where: { projectId_userId: { projectId, userId } },
        });
        if (!membership) {
            throw new common_1.ForbiddenException({ error: 'NOT_A_MEMBER', message: 'You are not a member of this project' });
        }
    }
};
exports.CommentsService = CommentsService;
exports.CommentsService = CommentsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CommentsService);
//# sourceMappingURL=comments.service.js.map