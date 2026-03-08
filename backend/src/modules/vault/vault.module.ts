import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from '../../prisma';

// Crypto
import { EncryptionService } from './crypto/encryption.service';

// Services
import { VaultAuditService } from './services/vault-audit.service';
import { VaultToolService } from './services/vault-tool.service';
import { VaultAccountService } from './services/vault-account.service';
import { VaultSecretService } from './services/vault-secret.service';

// Controllers
import { VaultToolController } from './controllers/vault-tool.controller';
import { VaultAccountController } from './controllers/vault-account.controller';
import { VaultSecretController } from './controllers/vault-secret.controller';
import { VaultAuditController } from './controllers/vault-audit.controller';

@Module({
    imports: [PrismaModule, ConfigModule],
    controllers: [
        VaultToolController,
        VaultAccountController,
        VaultSecretController,
        VaultAuditController,
    ],
    providers: [
        EncryptionService,
        VaultAuditService,
        VaultToolService,
        VaultAccountService,
        VaultSecretService,
    ],
    exports: [EncryptionService],
})
export class VaultModule { }
