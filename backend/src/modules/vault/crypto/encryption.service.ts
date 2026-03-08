import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

interface EncryptedPayload {
    iv: string;
    authTag: string;
    ciphertext: string;
    keyVersion: number;
}

@Injectable()
export class EncryptionService {
    private readonly logger = new Logger(EncryptionService.name);
    private readonly keys: Map<number, Buffer> = new Map();
    private readonly currentVersion: number;

    constructor(private readonly config: ConfigService) {
        this.currentVersion = parseInt(config.get<string>('VAULT_CURRENT_VERSION') || '1', 10);

        // Load all vault keys from env
        for (let v = 1; v <= 10; v++) {
            const hex = config.get<string>(`VAULT_KEY_V${v}`);
            if (hex) {
                this.keys.set(v, Buffer.from(hex, 'hex'));
            }
        }

        if (!this.keys.has(this.currentVersion)) {
            this.logger.warn(
                `VAULT_KEY_V${this.currentVersion} not found in environment. Vault encryption will fail.`,
            );
        }
    }

    encrypt(plaintext: string): string {
        const key = this.keys.get(this.currentVersion);
        if (!key) throw new Error(`Vault encryption key V${this.currentVersion} not configured`);

        const iv = crypto.randomBytes(16);
        const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);

        let ciphertext = cipher.update(plaintext, 'utf8', 'hex');
        ciphertext += cipher.final('hex');
        const authTag = cipher.getAuthTag().toString('hex');

        const payload: EncryptedPayload = {
            iv: iv.toString('hex'),
            authTag,
            ciphertext,
            keyVersion: this.currentVersion,
        };

        return JSON.stringify(payload);
    }

    decrypt(encryptedJson: string): string {
        const payload: EncryptedPayload = JSON.parse(encryptedJson);
        const key = this.keys.get(payload.keyVersion);
        if (!key) throw new Error(`Vault key V${payload.keyVersion} not available for decryption`);

        const decipher = crypto.createDecipheriv(
            'aes-256-gcm',
            key,
            Buffer.from(payload.iv, 'hex'),
        );
        decipher.setAuthTag(Buffer.from(payload.authTag, 'hex'));

        let plaintext = decipher.update(payload.ciphertext, 'hex', 'utf8');
        plaintext += decipher.final('utf8');
        return plaintext;
    }

    needsReEncrypt(keyVersion: number): boolean {
        return keyVersion < this.currentVersion;
    }

    getCurrentVersion(): number {
        return this.currentVersion;
    }
}
