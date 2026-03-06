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
exports.TasksService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let TasksService = class TasksService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(projectId, userId, data) {
        await this.verifyProjectAccess(projectId, userId, ['owner', 'editor']);
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
        if (data.tags?.length) {
            await this.syncTags(projectId, task.id, data.tags);
        }
        return this.findByIdInternal(task.id);
    }
    async findByProject(projectId, userId, filters) {
        await this.verifyProjectAccess(projectId, userId, ['owner', 'editor', 'viewer']);
        const page = filters?.page || 1;
        const limit = filters?.limit || 50;
        const skip = (page - 1) * limit;
        const where = {
            projectId,
            deletedAt: null,
            parentId: null,
        };
        if (filters?.status)
            where.status = filters.status;
        if (filters?.priority)
            where.priority = filters.priority;
        if (filters?.assigneeId)
            where.assigneeId = filters.assigneeId;
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
    async getBoard(projectId, userId) {
        await this.verifyProjectAccess(projectId, userId, ['owner', 'editor', 'viewer']);
        const tasks = await this.prisma.task.findMany({
            where: { projectId, deletedAt: null, parentId: null },
            include: this.taskIncludes(),
            orderBy: { position: 'asc' },
        });
        const board = {
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
    async findById(taskId, userId) {
        const task = await this.findByIdInternal(taskId);
        await this.verifyProjectAccess(task.projectId, userId, ['owner', 'editor', 'viewer']);
        return task;
    }
    async update(taskId, userId, data) {
        const task = await this.findByIdInternal(taskId);
        await this.verifyProjectAccess(task.projectId, userId, ['owner', 'editor']);
        const updateData = { ...data };
        if (data.dueDate)
            updateData.dueDate = new Date(data.dueDate);
        return this.prisma.task.update({
            where: { id: taskId },
            data: updateData,
            include: this.taskIncludes(),
        });
    }
    async reorder(projectId, userId, taskId, newPosition, newStatus) {
        await this.verifyProjectAccess(projectId, userId, ['owner', 'editor']);
        const task = await this.findByIdInternal(taskId);
        const targetStatus = newStatus || task.status;
        if (targetStatus !== task.status) {
            await this.prisma.task.updateMany({
                where: {
                    projectId,
                    status: task.status,
                    position: { gt: task.position },
                    deletedAt: null,
                },
                data: { position: { decrement: 1 } },
            });
            await this.prisma.task.updateMany({
                where: {
                    projectId,
                    status: targetStatus,
                    position: { gte: newPosition },
                    deletedAt: null,
                },
                data: { position: { increment: 1 } },
            });
        }
        else {
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
            }
            else if (newPosition < task.position) {
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
    async remove(taskId, userId) {
        const task = await this.findByIdInternal(taskId);
        await this.verifyProjectAccess(task.projectId, userId, ['owner', 'editor']);
        await this.prisma.task.update({
            where: { id: taskId },
            data: { deletedAt: new Date(), deletedBy: userId },
        });
        return { message: 'Task deleted' };
    }
    async updateTags(taskId, userId, tagNames) {
        const task = await this.findByIdInternal(taskId);
        await this.verifyProjectAccess(task.projectId, userId, ['owner', 'editor']);
        await this.syncTags(task.projectId, taskId, tagNames);
        return this.findByIdInternal(taskId);
    }
    async findByIdInternal(taskId) {
        const task = await this.prisma.task.findUnique({
            where: { id: taskId, deletedAt: null },
            include: this.taskIncludes(),
        });
        if (!task) {
            throw new common_1.NotFoundException({
                error: 'TASK_NOT_FOUND',
                message: 'Task not found',
            });
        }
        return task;
    }
    taskIncludes() {
        return {
            creator: { select: { id: true, name: true, email: true } },
            assignee: { select: { id: true, name: true, email: true } },
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
                orderBy: { position: 'asc' },
            },
            _count: { select: { comments: true, attachments: true } },
        };
    }
    async syncTags(projectId, taskId, tagNames) {
        await this.prisma.taskTag.deleteMany({ where: { taskId } });
        if (!tagNames.length)
            return;
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
    async verifyProjectAccess(projectId, userId, roles) {
        const membership = await this.prisma.projectMember.findUnique({
            where: { projectId_userId: { projectId, userId } },
        });
        if (!membership) {
            throw new common_1.ForbiddenException({
                error: 'NOT_A_MEMBER',
                message: 'You are not a member of this project',
            });
        }
        if (!roles.includes(membership.role)) {
            throw new common_1.ForbiddenException({
                error: 'INSUFFICIENT_ROLE',
                message: `This action requires one of: ${roles.join(', ')}`,
            });
        }
    }
};
exports.TasksService = TasksService;
exports.TasksService = TasksService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], TasksService);
//# sourceMappingURL=tasks.service.js.map