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
exports.VaultSecretController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const vault_secret_service_1 = require("../services/vault-secret.service");
const dto_1 = require("../dto");
const decorators_1 = require("../../auth/decorators");
let VaultSecretController = class VaultSecretController {
    secretService;
    constructor(secretService) {
        this.secretService = secretService;
    }
    findByAccount(accountId) {
        return this.secretService.findByAccount(accountId);
    }
    decrypt(id, userId, req) {
        return this.secretService.decrypt(id, userId, req.ip);
    }
    create(accountId, dto, userId) {
        return this.secretService.create(accountId, dto, userId);
    }
    update(id, dto, userId) {
        return this.secretService.update(id, dto, userId);
    }
    remove(id, userId) {
        return this.secretService.remove(id, userId);
    }
};
exports.VaultSecretController = VaultSecretController;
__decorate([
    (0, common_1.Get)('accounts/:accountId/secrets'),
    (0, swagger_1.ApiOperation)({ summary: 'List secret keys for account (NO values)' }),
    __param(0, (0, common_1.Param)('accountId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], VaultSecretController.prototype, "findByAccount", null);
__decorate([
    (0, common_1.Get)('secrets/:id/decrypt'),
    (0, swagger_1.ApiOperation)({ summary: 'Decrypt a secret (AUDITED)' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, decorators_1.CurrentUser)('id')),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", void 0)
], VaultSecretController.prototype, "decrypt", null);
__decorate([
    (0, common_1.Post)('accounts/:accountId/secrets'),
    (0, swagger_1.ApiOperation)({ summary: 'Create secret (encrypted on write)' }),
    __param(0, (0, common_1.Param)('accountId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, decorators_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dto_1.CreateSecretDto, String]),
    __metadata("design:returntype", void 0)
], VaultSecretController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)('secrets/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update secret value' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, decorators_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dto_1.UpdateSecretDto, String]),
    __metadata("design:returntype", void 0)
], VaultSecretController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)('secrets/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Soft delete secret' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, decorators_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], VaultSecretController.prototype, "remove", null);
exports.VaultSecretController = VaultSecretController = __decorate([
    (0, swagger_1.ApiTags)('vault-secrets'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('vault'),
    __metadata("design:paramtypes", [vault_secret_service_1.VaultSecretService])
], VaultSecretController);
//# sourceMappingURL=vault-secret.controller.js.map