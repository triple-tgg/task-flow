import { VaultToolService } from '../services/vault-tool.service';
import { CreateToolDto, UpdateToolDto } from '../dto';
export declare class VaultToolController {
    private readonly toolService;
    constructor(toolService: VaultToolService);
    findAll(page?: string, limit?: string, search?: string, category?: string): Promise<{
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
    create(dto: CreateToolDto, userId: string): Promise<{
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
    update(id: string, dto: UpdateToolDto, userId: string): Promise<{
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
