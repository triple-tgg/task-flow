import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { VaultAuditService } from './vault-audit.service';
import { VaultAction } from '@prisma/client';
import { CreateAccountDto, UpdateAccountDto } from '../dto';

@Injectable()
export class VaultAccountService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly audit: VaultAuditService,
    ) { }

    async findByTool(toolId: string, params: { page?: number; limit?: number }) {
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

    async findById(id: string) {
        const account = await this.prisma.vaultAccount.findFirst({
            where: { id, isDeleted: false },
            include: {
                tool: { select: { id: true, name: true, category: true } },
                secrets: {
                    where: { isDeleted: false },
                    select: { id: true, key: true, keyVersion: true, note: true, createdAt: true, updatedAt: true },
                },
                _count: { select: { secrets: { where: { isDeleted: false } } } },
            },
        });
        if (!account) throw new NotFoundException('VAULT_ACCOUNT_NOT_FOUND');
        return account;
    }

    async create(toolId: string, data: CreateAccountDto, userId: string) {
        const account = await this.prisma.vaultAccount.create({
            data: { ...data, toolId, createdBy: userId },
        });
        await this.audit.log({
            userId, action: VaultAction.CREATE,
            entityType: 'account', entityId: account.id,
            metadata: { name: account.name, toolId },
        });
        return account;
    }

    async update(id: string, data: UpdateAccountDto, userId: string) {
        const account = await this.findById(id);
        const updated = await this.prisma.vaultAccount.update({
            where: { id: account.id },
            data,
        });
        await this.audit.log({
            userId, action: VaultAction.UPDATE,
            entityType: 'account', entityId: account.id,
            metadata: { changes: data },
        });
        return updated;
    }

    async remove(id: string, userId: string) {
        const account = await this.findById(id);
        await this.prisma.$transaction([
            this.prisma.vaultAccount.update({ where: { id: account.id }, data: { isDeleted: true } }),
            this.prisma.vaultSecret.updateMany({ where: { accountId: account.id }, data: { isDeleted: true } }),
        ]);
        await this.audit.log({
            userId, action: VaultAction.DELETE,
            entityType: 'account', entityId: account.id,
            metadata: { name: account.name },
        });
        return { deleted: true };
    }
}
