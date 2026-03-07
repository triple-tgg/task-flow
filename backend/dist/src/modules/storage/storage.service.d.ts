export interface FileData {
    buffer: Buffer;
    originalname: string;
    mimetype: string;
    size: number;
}
export interface SaveFileResult {
    url: string;
    path: string;
    filename: string;
    size: number;
    mimeType: string;
}
export declare abstract class StorageService {
    abstract saveFile(file: FileData, folder?: string): Promise<SaveFileResult>;
    abstract deleteFile(path: string): Promise<void>;
    abstract getSignedUrl(path: string, expiresIn?: number): Promise<string>;
}
