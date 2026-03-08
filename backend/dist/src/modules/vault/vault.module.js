"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VaultModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const prisma_1 = require("../../prisma");
const encryption_service_1 = require("./crypto/encryption.service");
const vault_audit_service_1 = require("./services/vault-audit.service");
const vault_tool_service_1 = require("./services/vault-tool.service");
const vault_account_service_1 = require("./services/vault-account.service");
const vault_secret_service_1 = require("./services/vault-secret.service");
const vault_tool_controller_1 = require("./controllers/vault-tool.controller");
const vault_account_controller_1 = require("./controllers/vault-account.controller");
const vault_secret_controller_1 = require("./controllers/vault-secret.controller");
const vault_audit_controller_1 = require("./controllers/vault-audit.controller");
let VaultModule = class VaultModule {
};
exports.VaultModule = VaultModule;
exports.VaultModule = VaultModule = __decorate([
    (0, common_1.Module)({
        imports: [prisma_1.PrismaModule, config_1.ConfigModule],
        controllers: [
            vault_tool_controller_1.VaultToolController,
            vault_account_controller_1.VaultAccountController,
            vault_secret_controller_1.VaultSecretController,
            vault_audit_controller_1.VaultAuditController,
        ],
        providers: [
            encryption_service_1.EncryptionService,
            vault_audit_service_1.VaultAuditService,
            vault_tool_service_1.VaultToolService,
            vault_account_service_1.VaultAccountService,
            vault_secret_service_1.VaultSecretService,
        ],
        exports: [encryption_service_1.EncryptionService],
    })
], VaultModule);
//# sourceMappingURL=vault.module.js.map