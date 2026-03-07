import { AttachmentsService } from './attachments.service';
export declare class AttachmentsController {
    private readonly attachmentsService;
    constructor(attachmentsService: AttachmentsService);
    uploadAttachment(taskId: string, file: Express.Multer.File, req: any): Promise<{
        url: string;
        id: string;
        filename: string;
        storagePath: string;
        size: number;
        mimeType: string;
        createdAt: Date;
        deletedAt: Date | null;
        taskId: string;
        userId: string;
    }>;
    getTasksAttachments(taskId: string): Promise<{
        url: string;
        id: string;
        filename: string;
        storagePath: string;
        size: number;
        mimeType: string;
        createdAt: Date;
        deletedAt: Date | null;
        taskId: string;
        userId: string;
    }[]>;
    getAttachment(id: string): Promise<{
        url: string;
        id: string;
        filename: string;
        storagePath: string;
        size: number;
        mimeType: string;
        createdAt: Date;
        deletedAt: Date | null;
        taskId: string;
        userId: string;
    }>;
    deleteAttachment(id: string, req: any): Promise<{
        message: string;
    }>;
}
