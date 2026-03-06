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
exports.AnalyticsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let AnalyticsService = class AnalyticsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getDashboardStats(userId) {
        const memberships = await this.prisma.projectMember.findMany({
            where: { userId },
            select: { projectId: true, role: true },
        });
        const projectIds = memberships.map((m) => m.projectId);
        if (projectIds.length === 0) {
            return this.emptyStats();
        }
        const [totalProjects, totalTasks, tasksByStatus, tasksByPriority, myAssignedTasks, overdueTasks, recentTasks, recentActivity,] = await Promise.all([
            this.prisma.project.count({
                where: { id: { in: projectIds }, deletedAt: null },
            }),
            this.prisma.task.count({
                where: { projectId: { in: projectIds }, deletedAt: null },
            }),
            this.prisma.task.groupBy({
                by: ['status'],
                where: { projectId: { in: projectIds }, deletedAt: null },
                _count: { id: true },
            }),
            this.prisma.task.groupBy({
                by: ['priority'],
                where: { projectId: { in: projectIds }, deletedAt: null },
                _count: { id: true },
            }),
            this.prisma.task.count({
                where: {
                    assigneeId: userId,
                    deletedAt: null,
                    status: { not: 'done' },
                },
            }),
            this.prisma.task.count({
                where: {
                    projectId: { in: projectIds },
                    deletedAt: null,
                    status: { not: 'done' },
                    dueDate: { lt: new Date() },
                },
            }),
            this.prisma.task.findMany({
                where: {
                    projectId: { in: projectIds },
                    deletedAt: null,
                    createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
                },
                select: {
                    id: true,
                    title: true,
                    status: true,
                    priority: true,
                    projectId: true,
                    project: { select: { name: true } },
                    createdAt: true,
                },
                orderBy: { createdAt: 'desc' },
                take: 10,
            }),
            this.prisma.activityLog.findMany({
                where: {
                    projectId: { in: projectIds },
                    createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
                },
                orderBy: { createdAt: 'desc' },
                take: 15,
            }),
        ]);
        const statusMap = { todo: 0, in_progress: 0, review: 0, done: 0 };
        for (const group of tasksByStatus) {
            statusMap[group.status] = group._count.id;
        }
        const priorityMap = { low: 0, medium: 0, high: 0, urgent: 0 };
        for (const group of tasksByPriority) {
            priorityMap[group.priority] = group._count.id;
        }
        const completionRate = totalTasks > 0
            ? Math.round((statusMap.done / totalTasks) * 100)
            : 0;
        return {
            overview: {
                totalProjects,
                totalTasks,
                myAssignedTasks,
                overdueTasks,
                completionRate,
            },
            tasksByStatus: statusMap,
            tasksByPriority: priorityMap,
            recentTasks,
            recentActivity,
        };
    }
    async getCompletionTrend(userId) {
        const memberships = await this.prisma.projectMember.findMany({
            where: { userId },
            select: { projectId: true },
        });
        const projectIds = memberships.map((m) => m.projectId);
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        const completedTasks = await this.prisma.task.findMany({
            where: {
                projectId: { in: projectIds },
                status: 'done',
                updatedAt: { gte: thirtyDaysAgo },
            },
            select: { updatedAt: true },
        });
        const createdTasks = await this.prisma.task.findMany({
            where: {
                projectId: { in: projectIds },
                deletedAt: null,
                createdAt: { gte: thirtyDaysAgo },
            },
            select: { createdAt: true },
        });
        const days = [];
        for (let i = 29; i >= 0; i--) {
            const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
            const dateStr = date.toISOString().split('T')[0];
            days.push({ date: dateStr, created: 0, completed: 0 });
        }
        for (const t of createdTasks) {
            const dateStr = t.createdAt.toISOString().split('T')[0];
            const bucket = days.find((d) => d.date === dateStr);
            if (bucket)
                bucket.created++;
        }
        for (const t of completedTasks) {
            const dateStr = t.updatedAt.toISOString().split('T')[0];
            const bucket = days.find((d) => d.date === dateStr);
            if (bucket)
                bucket.completed++;
        }
        return days;
    }
    emptyStats() {
        return {
            overview: {
                totalProjects: 0,
                totalTasks: 0,
                myAssignedTasks: 0,
                overdueTasks: 0,
                completionRate: 0,
            },
            tasksByStatus: { todo: 0, in_progress: 0, review: 0, done: 0 },
            tasksByPriority: { low: 0, medium: 0, high: 0, urgent: 0 },
            recentTasks: [],
            recentActivity: [],
        };
    }
};
exports.AnalyticsService = AnalyticsService;
exports.AnalyticsService = AnalyticsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AnalyticsService);
//# sourceMappingURL=analytics.service.js.map