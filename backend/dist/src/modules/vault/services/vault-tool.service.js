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
exports.VaultToolService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../prisma/prisma.service");
const vault_audit_service_1 = require("./vault-audit.service");
const client_1 = require("@prisma/client");
let VaultToolService = class VaultToolService {
    prisma;
    audit;
    constructor(prisma, audit) {
        this.prisma = prisma;
        this.audit = audit;
    }
    async findAll(params) {
        const page = params.page || 1;
        const limit = params.limit || 20;
        const skip = (page - 1) * limit;
        const where = { isDeleted: false };
        if (params.category)
            where.category = params.category;
        if (params.search) {
            where.OR = [
                { name: { contains: params.search, mode: 'insensitive' } },
                { description: { contains: params.search, mode: 'insensitive' } },
            ];
        }
        const [data, total] = await Promise.all([
            this.prisma.vaultTool.findMany({
                where,
                include: { _count: { select: { accounts: { where: { isDeleted: false } } } } },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
            }),
            this.prisma.vaultTool.count({ where }),
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
        const tool = await this.prisma.vaultTool.findFirst({
            where: { id, isDeleted: false },
            include: { _count: { select: { accounts: { where: { isDeleted: false } } } } },
        });
        if (!tool)
            throw new common_1.NotFoundException('VAULT_TOOL_NOT_FOUND');
        return tool;
    }
    async create(data, userId) {
        const tool = await this.prisma.vaultTool.create({
            data: { ...data, createdBy: userId },
        });
        await this.audit.log({
            userId, action: client_1.VaultAction.CREATE,
            entityType: 'tool', entityId: tool.id,
            metadata: { name: tool.name },
        });
        return tool;
    }
    async update(id, data, userId) {
        const tool = await this.findById(id);
        const updated = await this.prisma.vaultTool.update({
            where: { id: tool.id },
            data,
        });
        await this.audit.log({
            userId, action: client_1.VaultAction.UPDATE,
            entityType: 'tool', entityId: tool.id,
            metadata: { changes: data },
        });
        return updated;
    }
    async remove(id, userId) {
        const tool = await this.findById(id);
        await this.prisma.$transaction([
            this.prisma.vaultTool.update({ where: { id: tool.id }, data: { isDeleted: true } }),
            this.prisma.vaultAccount.updateMany({ where: { toolId: tool.id }, data: { isDeleted: true } }),
            this.prisma.vaultSecret.updateMany({
                where: { account: { toolId: tool.id } },
                data: { isDeleted: true },
            }),
        ]);
        await this.audit.log({
            userId, action: client_1.VaultAction.DELETE,
            entityType: 'tool', entityId: tool.id,
            metadata: { name: tool.name },
        });
        return { deleted: true };
    }
};
exports.VaultToolService = VaultToolService;
exports.VaultToolService = VaultToolService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        vault_audit_service_1.VaultAuditService])
], VaultToolService);
//# sourceMappingURL=vault-tool.service.js.map