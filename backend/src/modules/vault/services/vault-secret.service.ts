import { Injectable, NotFoundException, ConflictException, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { VaultAuditService } from './vault-audit.service';
import { EncryptionService } from '../crypto/encryption.service';
import { VaultAction } from '@prisma/client';
import { CreateSecretDto, UpdateSecretDto } from '../dto';

@Injectable()
export class VaultSecretService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly audit: VaultAuditService,
        private readonly encryption: EncryptionService,
    ) { }

    async findByAccount(accountId: string) {
        // Return secret keys only — NO values
        return this.prisma.vaultSecret.findMany({
            where: { accountId, isDeleted: false },
            select: {
                id: true, key: true, keyVersion: true,
                createdAt: true, updatedAt: true, createdBy: true,
            },
        });
    }

    async decrypt(id: string, userId: string, ipAddress?: string) {
        const secret = await this.prisma.vaultSecret.findFirst({
            where: { id, isDeleted: false },
            include: { account: { select: { name: true, toolId: true } } },
        });
        if (!secret) throw new NotFoundException('VAULT_SECRET_NOT_FOUND');

        try {
            const plaintext = this.encryption.decrypt(secret.value);

            // ALWAYS audit decrypt actions
            await this.audit.log({
                userId, action: VaultAction.DECRYPT,
                entityType: 'secret', entityId: secret.id,
                metadata: { key: secret.key, accountName: secret.account.name },
                ipAddress,
            });

            return { id: secret.id, key: secret.key, value: plaintext };
        } catch (err) {
            throw new InternalServerErrorException('VAULT_DECRYPT_FAILED');
        }
    }

    async create(accountId: string, data: CreateSecretDto, userId: string) {
        // Check for duplicate key
        const existing = await this.prisma.vaultSecret.findFirst({
            where: { accountId, key: data.key.toUpperCase(), isDeleted: false },
        });
        if (existing) throw new ConflictException('VAULT_DUPLICATE_SECRET_KEY');

        const encryptedValue = this.encryption.encrypt(data.value);
        const secret = await this.prisma.vaultSecret.create({
            data: {
                accountId,
                key: data.key.toUpperCase(),
                value: encryptedValue,
                keyVersion: this.encryption.getCurrentVersion(),
                createdBy: userId,
            },
        });

        await this.audit.log({
            userId, action: VaultAction.CREATE,
            entityType: 'secret', entityId: secret.id,
            metadata: { key: secret.key, accountId },
        });

        return { id: secret.id, key: secret.key, createdAt: secret.createdAt };
    }

    async update(id: string, data: UpdateSecretDto, userId: string) {
        const secret = await this.prisma.vaultSecret.findFirst({
            where: { id, isDeleted: false },
        });
        if (!secret) throw new NotFoundException('VAULT_SECRET_NOT_FOUND');

        const encryptedValue = this.encryption.encrypt(data.value);
        const updated = await this.prisma.vaultSecret.update({
            where: { id: secret.id },
            data: {
                value: encryptedValue,
                keyVersion: this.encryption.getCurrentVersion(),
            },
        });

        await this.audit.log({
            userId, action: VaultAction.UPDATE,
            entityType: 'secret', entityId: secret.id,
            metadata: { key: secret.key },
        });

        return { id: updated.id, key: updated.key, updatedAt: updated.updatedAt };
    }

    async remove(id: string, userId: string) {
        const secret = await this.prisma.vaultSecret.findFirst({
            where: { id, isDeleted: false },
        });
        if (!secret) throw new NotFoundException('VAULT_SECRET_NOT_FOUND');

        await this.prisma.vaultSecret.update({
            where: { id: secret.id },
            data: { isDeleted: true },
        });

        await this.audit.log({
            userId, action: VaultAction.DELETE,
            entityType: 'secret', entityId: secret.id,
            metadata: { key: secret.key },
        });

        return { deleted: true };
    }
}
