import { ConfigService } from '@nestjs/config';
import { StorageService, FileData, SaveFileResult } from './storage.service';
export declare class LocalStorageService implements StorageService {
    private configService;
    private readonly logger;
    private readonly uploadDir;
    private readonly baseUrl;
    constructor(configService: ConfigService);
    private ensureDirectoryExists;
    saveFile(file: FileData, folder?: string): Promise<SaveFileResult>;
    deleteFile(relativePath: string): Promise<void>;
    getSignedUrl(relativePath: string, expiresIn?: number): Promise<string>;
}
