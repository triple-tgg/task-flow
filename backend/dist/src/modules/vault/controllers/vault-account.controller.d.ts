import { VaultAccountService } from '../services/vault-account.service';
import { CreateAccountDto, UpdateAccountDto } from '../dto';
export declare class VaultAccountController {
    private readonly accountService;
    constructor(accountService: VaultAccountService);
    findByTool(toolId: string, page?: string, limit?: string): Promise<{
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
            website: string | null;
            accountType: import("@prisma/client").$Enums.VaultAccountType;
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
            note: string | null;
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
        website: string | null;
        accountType: import("@prisma/client").$Enums.VaultAccountType;
        username: string | null;
        note: string | null;
        isDeleted: boolean;
        createdBy: string;
        toolId: string;
    }>;
    create(toolId: string, dto: CreateAccountDto, userId: string): Promise<{
        id: string;
        email: string | null;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        projectId: string | null;
        website: string | null;
        accountType: import("@prisma/client").$Enums.VaultAccountType;
        username: string | null;
        note: string | null;
        isDeleted: boolean;
        createdBy: string;
        toolId: string;
    }>;
    update(id: string, dto: UpdateAccountDto, userId: string): Promise<{
        id: string;
        email: string | null;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        projectId: string | null;
        website: string | null;
        accountType: import("@prisma/client").$Enums.VaultAccountType;
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
