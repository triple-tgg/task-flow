import { AttachmentsService } from './attachments.service';
export declare class AttachmentsController {
    private readonly attachmentsService;
    constructor(attachmentsService: AttachmentsService);
    uploadAttachment(taskId: string, file: Express.Multer.File, req: any): Promise<{
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
    getTasksAttachments(taskId: string): Promise<{
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
    getAttachment(id: string): Promise<{
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
    deleteAttachment(id: string, req: any): Promise<{
        message: string;
    }>;
}
