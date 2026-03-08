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
exports.VaultSecretService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../prisma/prisma.service");
const vault_audit_service_1 = require("./vault-audit.service");
const encryption_service_1 = require("../crypto/encryption.service");
const client_1 = require("@prisma/client");
let VaultSecretService = class VaultSecretService {
    prisma;
    audit;
    encryption;
    constructor(prisma, audit, encryption) {
        this.prisma = prisma;
        this.audit = audit;
        this.encryption = encryption;
    }
    async findByAccount(accountId) {
        return this.prisma.vaultSecret.findMany({
            where: { accountId, isDeleted: false },
            select: {
                id: true, key: true, keyVersion: true, note: true,
                createdAt: true, updatedAt: true, createdBy: true,
            },
        });
    }
    async decrypt(id, userId, ipAddress) {
        const secret = await this.prisma.vaultSecret.findFirst({
            where: { id, isDeleted: false },
            include: { account: { select: { name: true, toolId: true } } },
        });
        if (!secret)
            throw new common_1.NotFoundException('VAULT_SECRET_NOT_FOUND');
        try {
            const plaintext = this.encryption.decrypt(secret.value);
            await this.audit.log({
                userId, action: client_1.VaultAction.DECRYPT,
                entityType: 'secret', entityId: secret.id,
                metadata: { key: secret.key, accountName: secret.account.name },
                ipAddress,
            });
            return { id: secret.id, key: secret.key, value: plaintext, note: secret.note };
        }
        catch (err) {
            throw new common_1.InternalServerErrorException('VAULT_DECRYPT_FAILED');
        }
    }
    async create(accountId, data, userId) {
        const existing = await this.prisma.vaultSecret.findFirst({
            where: { accountId, key: data.key.toUpperCase(), isDeleted: false },
        });
        if (existing)
            throw new common_1.ConflictException('VAULT_DUPLICATE_SECRET_KEY');
        const encryptedValue = this.encryption.encrypt(data.value);
        const secret = await this.prisma.vaultSecret.create({
            data: {
                accountId,
                key: data.key.toUpperCase(),
                value: encryptedValue,
                note: data.note || undefined,
                keyVersion: this.encryption.getCurrentVersion(),
                createdBy: userId,
            },
        });
        await this.audit.log({
            userId, action: client_1.VaultAction.CREATE,
            entityType: 'secret', entityId: secret.id,
            metadata: { key: secret.key, accountId },
        });
        return { id: secret.id, key: secret.key, createdAt: secret.createdAt };
    }
    async update(id, data, userId) {
        const secret = await this.prisma.vaultSecret.findFirst({
            where: { id, isDeleted: false },
        });
        if (!secret)
            throw new common_1.NotFoundException('VAULT_SECRET_NOT_FOUND');
        const encryptedValue = this.encryption.encrypt(data.value);
        const updated = await this.prisma.vaultSecret.update({
            where: { id: secret.id },
            data: {
                value: encryptedValue,
                note: data.note !== undefined ? data.note : undefined,
                keyVersion: this.encryption.getCurrentVersion(),
            },
        });
        await this.audit.log({
            userId, action: client_1.VaultAction.UPDATE,
            entityType: 'secret', entityId: secret.id,
            metadata: { key: secret.key },
        });
        return { id: updated.id, key: updated.key, updatedAt: updated.updatedAt };
    }
    async remove(id, userId) {
        const secret = await this.prisma.vaultSecret.findFirst({
            where: { id, isDeleted: false },
        });
        if (!secret)
            throw new common_1.NotFoundException('VAULT_SECRET_NOT_FOUND');
        await this.prisma.vaultSecret.update({
            where: { id: secret.id },
            data: { isDeleted: true },
        });
        await this.audit.log({
            userId, action: client_1.VaultAction.DELETE,
            entityType: 'secret', entityId: secret.id,
            metadata: { key: secret.key },
        });
        return { deleted: true };
    }
};
exports.VaultSecretService = VaultSecretService;
exports.VaultSecretService = VaultSecretService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        vault_audit_service_1.VaultAuditService,
        encryption_service_1.EncryptionService])
], VaultSecretService);
//# sourceMappingURL=vault-secret.service.js.map