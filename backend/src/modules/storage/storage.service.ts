import { Injectable } from '@nestjs/common';

export interface FileData {
    buffer: Buffer;
    originalname: string;
    mimetype: string;
    size: number;
}

export interface SaveFileResult {
    url: string; // The URL to access the file
    path: string; // The internal storage path or reference
    filename: string;
    size: number;
    mimeType: string;
}

@Injectable()
export abstract class StorageService {
    /**
     * Saves a file to the storage provider
     * @param file The file data
     * @param folder Optional folder path within the bucket/storage
     * @returns Metadata about the saved file
     */
    abstract saveFile(file: FileData, folder?: string): Promise<SaveFileResult>;

    /**
     * Deletes a file from the storage provider
     * @param path The internal storage path or reference returned by saveFile
     */
    abstract deleteFile(path: string): Promise<void>;

    /**
     * Gets a pre-signed URL to download a file (primarily for S3)
     * For local storage, this might just return the public URL directly or a signed token if needed.
     * @param path The internal storage path
     * @param expiresIn Expiration time in seconds
     */
    abstract getSignedUrl(path: string, expiresIn?: number): Promise<string>;
}
