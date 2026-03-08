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
exports.VaultAccountService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../prisma/prisma.service");
const vault_audit_service_1 = require("./vault-audit.service");
const client_1 = require("@prisma/client");
let VaultAccountService = class VaultAccountService {
    prisma;
    audit;
    constructor(prisma, audit) {
        this.prisma = prisma;
        this.audit = audit;
    }
    async findByTool(toolId, params) {
        const page = params.page || 1;
        const limit = params.limit || 20;
        const skip = (page - 1) * limit;
        const where = { toolId, isDeleted: false };
        const [data, total] = await Promise.all([
            this.prisma.vaultAccount.findMany({
                where,
                include: { _count: { select: { secrets: { where: { isDeleted: false } } } } },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
            }),
            this.prisma.vaultAccount.count({ where }),
        ]);
        return {
            data,
            pagination: {
                page, limit, total,
                totalPages: Math.ceil(total / limit),
                hasNextPage: page * limit < total,
                hasPrevPage: page > 1,
            },
        };
    }
    async findById(id) {
        const account = await this.prisma.vaultAccount.findFirst({
            where: { id, isDeleted: false },
            include: {
                tool: { select: { id: true, name: true, category: true } },
                secrets: {
                    where: { isDeleted: false },
                    select: { id: true, key: true, keyVersion: true, createdAt: true, updatedAt: true },
                },
                _count: { select: { secrets: { where: { isDeleted: false } } } },
            },
        });
        if (!account)
            throw new common_1.NotFoundException('VAULT_ACCOUNT_NOT_FOUND');
        return account;
    }
    async create(toolId, data, userId) {
        const account = await this.prisma.vaultAccount.create({
            data: { ...data, toolId, createdBy: userId },
        });
        await this.audit.log({
            userId, action: client_1.VaultAction.CREATE,
            entityType: 'account', entityId: account.id,
            metadata: { name: account.name, toolId },
        });
        return account;
    }
    async update(id, data, userId) {
        const account = await this.findById(id);
        const updated = await this.prisma.vaultAccount.update({
            where: { id: account.id },
            data,
        });
        await this.audit.log({
            userId, action: client_1.VaultAction.UPDATE,
            entityType: 'account', entityId: account.id,
            metadata: { changes: data },
        });
        return updated;
    }
    async remove(id, userId) {
        const account = await this.findById(id);
        await this.prisma.$transaction([
            this.prisma.vaultAccount.update({ where: { id: account.id }, data: { isDeleted: true } }),
            this.prisma.vaultSecret.updateMany({ where: { accountId: account.id }, data: { isDeleted: true } }),
        ]);
        await this.audit.log({
            userId, action: client_1.VaultAction.DELETE,
            entityType: 'account', entityId: account.id,
            metadata: { name: account.name },
        });
        return { deleted: true };
    }
};
exports.VaultAccountService = VaultAccountService;
exports.VaultAccountService = VaultAccountService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        vault_audit_service_1.VaultAuditService])
], VaultAccountService);
//# sourceMappingURL=vault-account.service.js.map