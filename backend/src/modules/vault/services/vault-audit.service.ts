import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { VaultAction } from '@prisma/client';

@Injectable()
export class VaultAuditService {
    constructor(private readonly prisma: PrismaService) { }

    async log(params: {
        userId: string;
        action: VaultAction;
        entityType: string;
        entityId: string;
        metadata?: Record<string, any>;
        ipAddress?: string;
    }) {
        return this.prisma.vaultAuditLog.create({
            data: {
                userId: params.userId,
                action: params.action,
                entityType: params.entityType,
                entityId: params.entityId,
                metadata: params.metadata || undefined,
                ipAddress: params.ipAddress || undefined,
            },
        });
    }

    async findAll(params: {
        page?: number;
        limit?: number;
        userId?: string;
        action?: VaultAction;
        entityType?: string;
    }) {
        const page = params.page || 1;
        const limit = params.limit || 20;
        const skip = (page - 1) * limit;

        const where: any = {};
        if (params.userId) where.userId = params.userId;
        if (params.action) where.action = params.action;
        if (params.entityType) where.entityType = params.entityType;

        const [data, total] = await Promise.all([
            this.prisma.vaultAuditLog.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
            }),
            this.prisma.vaultAuditLog.count({ where }),
        ]);

        return {
            data,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
                hasNextPage: page * limit < total,
                hasPrevPage: page > 1,
            },
        };
    }
}
