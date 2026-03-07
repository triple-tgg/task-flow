import { Injectable, Logger, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as crypto from 'crypto';
import { StorageService, FileData, SaveFileResult } from './storage.service';

@Injectable()
export class LocalStorageService implements StorageService {
    private readonly logger = new Logger(LocalStorageService.name);
    private readonly uploadDir: string;
    private readonly baseUrl: string;

    constructor(private configService: ConfigService) {
        // We store files in the root folder /uploads or /backend/uploads
        // Using an absolute path relative to the process working directory is safest
        this.uploadDir = path.resolve(process.cwd(), 'uploads');

        // Fallback to localhost if not specified
        const port = this.configService.get<string>('PORT') || '3000';
        this.baseUrl = this.configService.get<string>('BACKEND_URL') || `http://localhost:${port}`;

        // Ensure the root upload directory exists on startup
        this.ensureDirectoryExists(this.uploadDir).catch((err) => {
            this.logger.error(`Failed to create upload directory at ${this.uploadDir}`, err);
        });
    }

    private async ensureDirectoryExists(dir: string): Promise<void> {
        try {
            await fs.access(dir);
        } catch {
            await fs.mkdir(dir, { recursive: true });
        }
    }

    async saveFile(file: FileData, folder?: string): Promise<SaveFileResult> {
        try {
            // 1. Determine target directory
            const targetDir = folder ? path.join(this.uploadDir, folder) : this.uploadDir;
            await this.ensureDirectoryExists(targetDir);

            // 2. Generate a secure, unique filename to prevent overwriting
            const ext = path.extname(file.originalname);
            const uuid = crypto.randomUUID();
            const uniqueFilename = `${uuid}${ext}`;

            const fullPath = path.join(targetDir, uniqueFilename);

            // 3. Save to disk
            await fs.writeFile(fullPath, file.buffer);

            this.logger.log(`File saved locally: ${fullPath}`);

            // 4. Create relative path for DB storage (e.g. "tasks/123e4567/uuid.png")
            const relativePath = folder ? path.join(folder, uniqueFilename) : uniqueFilename;

            // 5. Construct public URL (e.g., http://localhost:3000/uploads/...)
            // We will need to serve static files from '/uploads' route in NestJS
            // Using forward slashes for URLs even on Windows
            const urlPath = relativePath.split(path.sep).join('/');
            const publicUrl = `${this.baseUrl}/uploads/${urlPath}`;

            return {
                url: publicUrl,
                path: relativePath,
                filename: file.originalname,
                size: file.size,
                mimeType: file.mimetype,
            };
        } catch (error: any) {
            this.logger.error(`Failed to save file locally`, error.stack);
            throw new InternalServerErrorException('Failed to save file');
        }
    }

    async deleteFile(relativePath: string): Promise<void> {
        try {
            const fullPath = path.join(this.uploadDir, relativePath);
            await fs.unlink(fullPath);
            this.logger.log(`File deleted locally: ${fullPath}`);
        } catch (error: any) {
            // Ignore if file doesn't exist
            if (error.code !== 'ENOENT') {
                this.logger.error(`Failed to delete file locally: ${relativePath}`, error.stack);
                throw new InternalServerErrorException('Failed to delete file');
            }
        }
    }

    async getSignedUrl(relativePath: string, expiresIn?: number): Promise<string> {
        // For local storage, we just return the public URL.
        // In a real app with restricted local files, we'd generate a JWT token 
        // and return a signed download URL. For simplicity, we just return the direct URL.
        const urlPath = relativePath.split(path.sep).join('/');
        return `${this.baseUrl}/uploads/${urlPath}`;
    }
}
