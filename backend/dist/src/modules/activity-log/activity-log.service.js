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
exports.ActivityLogService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let ActivityLogService = class ActivityLogService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async log(params) {
        return this.prisma.activityLog.create({
            data: {
                userId: params.userId,
                projectId: params.projectId,
                action: params.action,
                entityType: params.entityType,
                entityId: params.entityId,
                metadata: params.metadata || undefined,
            },
        });
    }
    async getByProject(projectId, page = 1, limit = 30) {
        const skip = (page - 1) * limit;
        const [logs, total] = await Promise.all([
            this.prisma.activityLog.findMany({
                where: { projectId },
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
            }),
            this.prisma.activityLog.count({ where: { projectId } }),
        ]);
        return {
            data: logs,
            meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
        };
    }
    async getByUser(userId, page = 1, limit = 30) {
        const skip = (page - 1) * limit;
        const [logs, total] = await Promise.all([
            this.prisma.activityLog.findMany({
                where: { userId },
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
            }),
            this.prisma.activityLog.count({ where: { userId } }),
        ]);
        return {
            data: logs,
            meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
        };
    }
    async purgeOldLogs(daysToKeep = 90) {
        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - daysToKeep);
        const result = await this.prisma.activityLog.deleteMany({
            where: { createdAt: { lt: cutoff } },
        });
        return { deleted: result.count };
    }
};
exports.ActivityLogService = ActivityLogService;
exports.ActivityLogService = ActivityLogService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ActivityLogService);
//# sourceMappingURL=activity-log.service.js.map