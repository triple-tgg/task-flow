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
exports.ProjectsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const projects_service_1 = require("./projects.service");
const dto_1 = require("./dto");
const decorators_1 = require("../auth/decorators");
const decorators_2 = require("../auth/decorators");
let ProjectsController = class ProjectsController {
    projectsService;
    constructor(projectsService) {
        this.projectsService = projectsService;
    }
    async create(userId, dto) {
        return this.projectsService.create(userId, dto);
    }
    async findAll(userId, page, limit) {
        return this.projectsService.findByUser(userId, page ? parseInt(page, 10) : 1, limit ? parseInt(limit, 10) : 20);
    }
    async findOne(id, userId) {
        return this.projectsService.findById(id, userId);
    }
    async update(id, userId, dto) {
        return this.projectsService.update(id, userId, dto);
    }
    async remove(id, userId) {
        return this.projectsService.remove(id, userId);
    }
    async addMember(projectId, requesterId, dto) {
        return this.projectsService.addMember(projectId, requesterId, dto.userId, dto.role);
    }
    async updateMemberRole(projectId, targetUserId, requesterId, dto) {
        return this.projectsService.updateMemberRole(projectId, requesterId, targetUserId, dto.role);
    }
    async removeMember(projectId, targetUserId, requesterId) {
        return this.projectsService.removeMember(projectId, requesterId, targetUserId);
    }
    async enableShare(projectId, userId) {
        return this.projectsService.generateShareLink(projectId, userId);
    }
    async revokeShare(projectId, userId) {
        return this.projectsService.revokeShareLink(projectId, userId);
    }
    async viewPublic(token) {
        return this.projectsService.findByShareToken(token);
    }
};
exports.ProjectsController = ProjectsController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new project' }),
    __param(0, (0, decorators_1.CurrentUser)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dto_1.CreateProjectDto]),
    __metadata("design:returntype", Promise)
], ProjectsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'List my projects' }),
    __param(0, (0, decorators_1.CurrentUser)('id')),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], ProjectsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get project details' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, decorators_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], ProjectsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update project' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, decorators_1.CurrentUser)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, dto_1.UpdateProjectDto]),
    __metadata("design:returntype", Promise)
], ProjectsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Delete project (owner only)' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, decorators_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], ProjectsController.prototype, "remove", null);
__decorate([
    (0, common_1.Post)(':id/members'),
    (0, swagger_1.ApiOperation)({ summary: 'Add member to project' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, decorators_1.CurrentUser)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, dto_1.AddMemberDto]),
    __metadata("design:returntype", Promise)
], ProjectsController.prototype, "addMember", null);
__decorate([
    (0, common_1.Put)(':id/members/:userId'),
    (0, swagger_1.ApiOperation)({ summary: 'Update member role' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Param)('userId')),
    __param(2, (0, decorators_1.CurrentUser)('id')),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, dto_1.UpdateMemberRoleDto]),
    __metadata("design:returntype", Promise)
], ProjectsController.prototype, "updateMemberRole", null);
__decorate([
    (0, common_1.Delete)(':id/members/:userId'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Remove member from project' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Param)('userId')),
    __param(2, (0, decorators_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], ProjectsController.prototype, "removeMember", null);
__decorate([
    (0, common_1.Post)(':id/share'),
    (0, swagger_1.ApiOperation)({ summary: 'Enable public share link (owner only)' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, decorators_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], ProjectsController.prototype, "enableShare", null);
__decorate([
    (0, common_1.Delete)(':id/share'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Revoke public share link (owner only)' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, decorators_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], ProjectsController.prototype, "revokeShare", null);
__decorate([
    (0, decorators_2.Public)(),
    (0, common_1.Get)('public/:token'),
    (0, swagger_1.ApiOperation)({ summary: 'View project via public share link (no auth required)' }),
    __param(0, (0, common_1.Param)('token')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ProjectsController.prototype, "viewPublic", null);
exports.ProjectsController = ProjectsController = __decorate([
    (0, swagger_1.ApiTags)('projects'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('projects'),
    __metadata("design:paramtypes", [projects_service_1.ProjectsService])
], ProjectsController);
//# sourceMappingURL=projects.controller.js.map