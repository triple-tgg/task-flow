import { PrismaService } from '../../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';
export declare class AttachmentsService {
    private readonly prisma;
    private readonly storage;
    constructor(prisma: PrismaService, storage: StorageService);
    uploadAttachment(taskId: string, userId: string, file: Express.Multer.File): Promise<{
        url: string;
        id: string;
        createdAt: Date;
        deletedAt: Date | null;
        userId: string;
        taskId: string;
        filename: string;
        size: number;
        mimeType: string;
        storagePath: string;
    }>;
    getAttachment(attachmentId: string): Promise<{
        url: string;
        id: string;
        createdAt: Date;
        deletedAt: Date | null;
        userId: string;
        taskId: string;
        filename: string;
        size: number;
        mimeType: string;
        storagePath: string;
    }>;
    deleteAttachment(attachmentId: string, userId: string): Promise<{
        message: string;
    }>;
    getAttachmentsForTask(taskId: string): Promise<{
        url: string;
        id: string;
        createdAt: Date;
        deletedAt: Date | null;
        userId: string;
        taskId: string;
        filename: string;
        size: number;
        mimeType: string;
        storagePath: string;
    }[]>;
}
