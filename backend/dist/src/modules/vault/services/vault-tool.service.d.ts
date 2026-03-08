import { PrismaService } from '../../../prisma/prisma.service';
import { VaultAuditService } from './vault-audit.service';
import { CreateToolDto, UpdateToolDto } from '../dto';
export declare class VaultToolService {
    private readonly prisma;
    private readonly audit;
    constructor(prisma: PrismaService, audit: VaultAuditService);
    findAll(params: {
        page?: number;
        limit?: number;
        search?: string;
        category?: string;
    }): Promise<{
        data: ({
            _count: {
                accounts: number;
            };
        } & {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            description: string | null;
            category: string | null;
            website: string | null;
            iconUrl: string | null;
            isDeleted: boolean;
            createdBy: string;
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
            accounts: number;
        };
    } & {
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        category: string | null;
        website: string | null;
        iconUrl: string | null;
        isDeleted: boolean;
        createdBy: string;
    }>;
    create(data: CreateToolDto, userId: string): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        category: string | null;
        website: string | null;
        iconUrl: string | null;
        isDeleted: boolean;
        createdBy: string;
    }>;
    update(id: string, data: UpdateToolDto, userId: string): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        category: string | null;
        website: string | null;
        iconUrl: string | null;
        isDeleted: boolean;
        createdBy: string;
    }>;
    remove(id: string, userId: string): Promise<{
        deleted: boolean;
    }>;
}
