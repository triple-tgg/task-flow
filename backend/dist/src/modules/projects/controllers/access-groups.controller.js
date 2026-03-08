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
exports.AccessGroupsController = void 0;
const common_1 = require("@nestjs/common");
const access_groups_service_1 = require("../services/access-groups.service");
const jwt_auth_guard_1 = require("../../auth/guards/jwt-auth.guard");
let AccessGroupsController = class AccessGroupsController {
    accessGroupsService;
    constructor(accessGroupsService) {
        this.accessGroupsService = accessGroupsService;
    }
    findAll(projectId) {
        return this.accessGroupsService.findAllByProject(projectId);
    }
    createGroup(projectId, data) {
        return this.accessGroupsService.createGroup(projectId, data);
    }
    updateGroup(groupId, data) {
        return this.accessGroupsService.updateGroup(groupId, data);
    }
    deleteGroup(groupId) {
        return this.accessGroupsService.deleteGroup(groupId);
    }
    createLink(groupId, data) {
        return this.accessGroupsService.createLink(groupId, data);
    }
    updateLink(linkId, data) {
        return this.accessGroupsService.updateLink(linkId, data);
    }
    deleteLink(linkId) {
        return this.accessGroupsService.deleteLink(linkId);
    }
};
exports.AccessGroupsController = AccessGroupsController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Param)('projectId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AccessGroupsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Param)('projectId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], AccessGroupsController.prototype, "createGroup", null);
__decorate([
    (0, common_1.Patch)(':groupId'),
    __param(0, (0, common_1.Param)('groupId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], AccessGroupsController.prototype, "updateGroup", null);
__decorate([
    (0, common_1.Delete)(':groupId'),
    __param(0, (0, common_1.Param)('groupId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AccessGroupsController.prototype, "deleteGroup", null);
__decorate([
    (0, common_1.Post)(':groupId/links'),
    __param(0, (0, common_1.Param)('groupId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], AccessGroupsController.prototype, "createLink", null);
__decorate([
    (0, common_1.Patch)(':groupId/links/:linkId'),
    __param(0, (0, common_1.Param)('linkId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], AccessGroupsController.prototype, "updateLink", null);
__decorate([
    (0, common_1.Delete)(':groupId/links/:linkId'),
    __param(0, (0, common_1.Param)('linkId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AccessGroupsController.prototype, "deleteLink", null);
exports.AccessGroupsController = AccessGroupsController = __decorate([
    (0, common_1.Controller)('projects/:projectId/access-groups'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [access_groups_service_1.AccessGroupsService])
], AccessGroupsController);
//# sourceMappingURL=access-groups.controller.js.map