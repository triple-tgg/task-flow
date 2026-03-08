import { PrismaService } from '../../../prisma/prisma.service';
import { VaultAuditService } from './vault-audit.service';
import { CreateAccountDto, UpdateAccountDto } from '../dto';
export declare class VaultAccountService {
    private readonly prisma;
    private readonly audit;
    constructor(prisma: PrismaService, audit: VaultAuditService);
    findByTool(toolId: string, params: {
        page?: number;
        limit?: number;
    }): Promise<{
        data: ({
            _count: {
                secrets: number;
            };
        } & {
            id: string;
            email: string | null;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            projectId: string | null;
            username: string | null;
            note: string | null;
            isDeleted: boolean;
            createdBy: string;
            toolId: string;
        })[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
            hasNextPage: boolean;
            hasPrevPage: boolean;
        };
    }>;
    findById(id: string): Promise<{
        _count: {
            secrets: number;
        };
        tool: {
            id: string;
            name: string;
            category: string | null;
        };
        secrets: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            key: string;
            keyVersion: number;
        }[];
    } & {
        id: string;
        email: string | null;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        projectId: string | null;
        username: string | null;
        note: string | null;
        isDeleted: boolean;
        createdBy: string;
        toolId: string;
    }>;
    create(toolId: string, data: CreateAccountDto, userId: string): Promise<{
        id: string;
        email: string | null;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        projectId: string | null;
        username: string | null;
        note: string | null;
        isDeleted: boolean;
        createdBy: string;
        toolId: string;
    }>;
    update(id: string, data: UpdateAccountDto, userId: string): Promise<{
        id: string;
        email: string | null;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        projectId: string | null;
        username: string | null;
        note: string | null;
        isDeleted: boolean;
        createdBy: string;
        toolId: string;
    }>;
    remove(id: string, userId: string): Promise<{
        deleted: boolean;
    }>;
}
