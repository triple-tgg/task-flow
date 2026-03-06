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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ActivityLogController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const activity_log_service_1 = require("./activity-log.service");
const decorators_1 = require("../auth/decorators");
const prisma_service_1 = require("../../prisma/prisma.service");
let ActivityLogController = class ActivityLogController {
    activityLogService;
    prisma;
    constructor(activityLogService, prisma) {
        this.activityLogService = activityLogService;
        this.prisma = prisma;
    }
    async getMyActivity(userId, page, limit) {
        return this.activityLogService.getByUser(userId, page ? parseInt(page, 10) : 1, limit ? parseInt(limit, 10) : 30);
    }
    async getProjectActivity(projectId, userId, page, limit) {
        const membership = await this.prisma.projectMember.findUnique({
            where: { projectId_userId: { projectId, userId } },
        });
        if (!membership) {
            throw new common_1.ForbiddenException({
                error: 'NOT_A_MEMBER',
                message: 'You are not a member of this project',
            });
        }
        return this.activityLogService.getByProject(projectId, page ? parseInt(page, 10) : 1, limit ? parseInt(limit, 10) : 30);
    }
};
exports.ActivityLogController = ActivityLogController;
__decorate([
    (0, common_1.Get)('me'),
    (0, swagger_1.ApiOperation)({ summary: 'Get my recent activity' }),
    __param(0, (0, decorators_1.CurrentUser)('id')),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], ActivityLogController.prototype, "getMyActivity", null);
__decorate([
    (0, common_1.Get)('projects/:projectId'),
    (0, swagger_1.ApiOperation)({ summary: 'Get project activity log' }),
    __param(0, (0, common_1.Param)('projectId')),
    __param(1, (0, decorators_1.CurrentUser)('id')),
    __param(2, (0, common_1.Query)('page')),
    __param(3, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String]),
    __metadata("design:returntype", Promise)
], ActivityLogController.prototype, "getProjectActivity", null);
exports.ActivityLogController = ActivityLogController = __decorate([
    (0, swagger_1.ApiTags)('activity-log'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('activity-log'),
    __metadata("design:paramtypes", [activity_log_service_1.ActivityLogService,
        prisma_service_1.PrismaService])
], ActivityLogController);
//# sourceMappingURL=activity-log.controller.js.map