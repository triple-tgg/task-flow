import { ConfigService } from '@nestjs/config';
export declare class EncryptionService {
    private readonly config;
    private readonly logger;
    private readonly keys;
    private readonly currentVersion;
    constructor(config: ConfigService);
    encrypt(plaintext: string): string;
    decrypt(encryptedJson: string): string;
    needsReEncrypt(keyVersion: number): boolean;
    getCurrentVersion(): number;
}
