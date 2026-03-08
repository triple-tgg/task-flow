import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { VaultAuditService } from './vault-audit.service';
import { VaultAction } from '@prisma/client';
import { CreateToolDto, UpdateToolDto } from '../dto';

@Injectable()
export class VaultToolService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly audit: VaultAuditService,
    ) { }

    async findAll(params: { page?: number; limit?: number; search?: string; category?: string }) {
        const page = params.page || 1;
        const limit = params.limit || 20;
        const skip = (page - 1) * limit;

        const where: any = { isDeleted: false };
        if (params.category) where.category = params.category;
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

    async findById(id: string) {
        const tool = await this.prisma.vaultTool.findFirst({
            where: { id, isDeleted: false },
            include: { _count: { select: { accounts: { where: { isDeleted: false } } } } },
        });
        if (!tool) throw new NotFoundException('VAULT_TOOL_NOT_FOUND');
        return tool;
    }

    async create(data: CreateToolDto, userId: string) {
        const tool = await this.prisma.vaultTool.create({
            data: { ...data, createdBy: userId },
        });
        await this.audit.log({
            userId, action: VaultAction.CREATE,
            entityType: 'tool', entityId: tool.id,
            metadata: { name: tool.name },
        });
        return tool;
    }

    async update(id: string, data: UpdateToolDto, userId: string) {
        const tool = await this.findById(id);
        const updated = await this.prisma.vaultTool.update({
            where: { id: tool.id },
            data,
        });
        await this.audit.log({
            userId, action: VaultAction.UPDATE,
            entityType: 'tool', entityId: tool.id,
            metadata: { changes: data },
        });
        return updated;
    }

    async remove(id: string, userId: string) {
        const tool = await this.findById(id);
        // Soft delete tool + cascade accounts + secrets
        await this.prisma.$transaction([
            this.prisma.vaultTool.update({ where: { id: tool.id }, data: { isDeleted: true } }),
            this.prisma.vaultAccount.updateMany({ where: { toolId: tool.id }, data: { isDeleted: true } }),
            this.prisma.vaultSecret.updateMany({
                where: { account: { toolId: tool.id } },
                data: { isDeleted: true },
            }),
        ]);
        await this.audit.log({
            userId, action: VaultAction.DELETE,
            entityType: 'tool', entityId: tool.id,
            metadata: { name: tool.name },
        });
        return { deleted: true };
    }
}
