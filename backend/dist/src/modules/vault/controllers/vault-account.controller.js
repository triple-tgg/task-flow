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
exports.VaultAccountController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const vault_account_service_1 = require("../services/vault-account.service");
const dto_1 = require("../dto");
const decorators_1 = require("../../auth/decorators");
let VaultAccountController = class VaultAccountController {
    accountService;
    constructor(accountService) {
        this.accountService = accountService;
    }
    findByTool(toolId, page, limit) {
        return this.accountService.findByTool(toolId, {
            page: page ? parseInt(page, 10) : undefined,
            limit: limit ? parseInt(limit, 10) : undefined,
        });
    }
    findById(id) {
        return this.accountService.findById(id);
    }
    create(toolId, dto, userId) {
        return this.accountService.create(toolId, dto, userId);
    }
    update(id, dto, userId) {
        return this.accountService.update(id, dto, userId);
    }
    remove(id, userId) {
        return this.accountService.remove(id, userId);
    }
};
exports.VaultAccountController = VaultAccountController;
__decorate([
    (0, common_1.Get)('tools/:toolId/accounts'),
    (0, swagger_1.ApiOperation)({ summary: 'List accounts for a tool' }),
    __param(0, (0, common_1.Param)('toolId')),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", void 0)
], VaultAccountController.prototype, "findByTool", null);
__decorate([
    (0, common_1.Get)('accounts/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get account detail (secret keys only, NO values)' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], VaultAccountController.prototype, "findById", null);
__decorate([
    (0, common_1.Post)('tools/:toolId/accounts'),
    (0, swagger_1.ApiOperation)({ summary: 'Create account for a tool' }),
    __param(0, (0, common_1.Param)('toolId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, decorators_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dto_1.CreateAccountDto, String]),
    __metadata("design:returntype", void 0)
], VaultAccountController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)('accounts/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update account metadata' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, decorators_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dto_1.UpdateAccountDto, String]),
    __metadata("design:returntype", void 0)
], VaultAccountController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)('accounts/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Soft delete account + cascade secrets' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, decorators_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], VaultAccountController.prototype, "remove", null);
exports.VaultAccountController = VaultAccountController = __decorate([
    (0, swagger_1.ApiTags)('vault-accounts'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('vault'),
    __metadata("design:paramtypes", [vault_account_service_1.VaultAccountService])
], VaultAccountController);
//# sourceMappingURL=vault-account.controller.js.map