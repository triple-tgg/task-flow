import { PrismaService } from '../../../prisma/prisma.service';
import { VaultAuditService } from './vault-audit.service';
import { EncryptionService } from '../crypto/encryption.service';
import { CreateSecretDto, UpdateSecretDto } from '../dto';
export declare class VaultSecretService {
    private readonly prisma;
    private readonly audit;
    private readonly encryption;
    constructor(prisma: PrismaService, audit: VaultAuditService, encryption: EncryptionService);
    findByAccount(accountId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        key: string;
        createdBy: string;
        keyVersion: number;
    }[]>;
    decrypt(id: string, userId: string, ipAddress?: string): Promise<{
        id: string;
        key: string;
        value: string;
    }>;
    create(accountId: string, data: CreateSecretDto, userId: string): Promise<{
        id: string;
        key: string;
        createdAt: Date;
    }>;
    update(id: string, data: UpdateSecretDto, userId: string): Promise<{
        id: string;
        key: string;
        updatedAt: Date;
    }>;
    remove(id: string, userId: string): Promise<{
        deleted: boolean;
    }>;
}
