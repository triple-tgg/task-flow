import { VaultSecretService } from '../services/vault-secret.service';
import { CreateSecretDto, UpdateSecretDto } from '../dto';
import type { Request } from 'express';
export declare class VaultSecretController {
    private readonly secretService;
    constructor(secretService: VaultSecretService);
    findByAccount(accountId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        note: string | null;
        key: string;
        createdBy: string;
        keyVersion: number;
    }[]>;
    decrypt(id: string, userId: string, req: Request): Promise<{
        id: string;
        key: string;
        value: string;
        note: string | null;
    }>;
    create(accountId: string, dto: CreateSecretDto, userId: string): Promise<{
        id: string;
        key: string;
        createdAt: Date;
    }>;
    update(id: string, dto: UpdateSecretDto, userId: string): Promise<{
        id: string;
        key: string;
        updatedAt: Date;
    }>;
    remove(id: string, userId: string): Promise<{
        deleted: boolean;
    }>;
}
