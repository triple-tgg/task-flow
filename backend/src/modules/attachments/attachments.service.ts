import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { StorageService, FileData } from '../storage/storage.service';

@Injectable()
export class AttachmentsService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly storage: StorageService,
    ) { }

    /**
     * Upload an attachment for a specific task
     */
    async uploadAttachment(
        taskId: string,
        userId: string,
        file: Express.Multer.File,
    ) {
        // 1. Verify the task exists
        const task = await this.prisma.task.findUnique({
            where: { id: taskId },
        });

        if (!task) {
            throw new NotFoundException(`Task with ID ${taskId} not found`);
        }

        // Optional: Verify user has permission to upload to this project/task
        // (We will assume standard access for now, in a real app check projectMembers)

        // 2. Map Express.Multer.File to our generic FileData
        // Multer encodes originalname as Latin1 — decode to UTF-8 for Thai/Unicode support
        const decodedFilename = Buffer.from(file.originalname, 'latin1').toString('utf-8');
        const fileData: FileData = {
            buffer: file.buffer,
            originalname: decodedFilename,
            mimetype: file.mimetype,
            size: file.size,
        };

        // 3. Save the physical file using the generic Storage Service
        // We group files by taskId internally to keep things organized
        const folder = `tasks/${taskId}`;
        const savedFile = await this.storage.saveFile(fileData, folder);

        // 4. Save metadata in database
        const attachment = await this.prisma.attachment.create({
            data: {
                taskId,
                userId,
                filename: savedFile.filename,
                storagePath: savedFile.path, // Store the relative path/key
                size: savedFile.size,
                mimeType: savedFile.mimeType,
            },
        });

        return {
            ...attachment,
            url: savedFile.url, // Return the public URL for immediate usage
        };
    }

    /**
     * Generates URLs for downloading
     */
    async getAttachment(attachmentId: string) {
        const attachment = await this.prisma.attachment.findUnique({
            where: { id: attachmentId },
        });

        if (!attachment || attachment.deletedAt) {
            throw new NotFoundException(`Attachment ${attachmentId} not found`);
        }

        const url = await this.storage.getSignedUrl(attachment.storagePath);

        return {
            ...attachment,
            url,
        };
    }

    /**
     * Delete an attachment
     */
    async deleteAttachment(attachmentId: string, userId: string) {
        const attachment = await this.prisma.attachment.findUnique({
            where: { id: attachmentId },
            include: { task: true },
        });

        if (!attachment || attachment.deletedAt) {
            throw new NotFoundException(`Attachment ${attachmentId} not found`);
        }

        // Only the uploader or project owner should be able to delete
        // For simplicity, we just check if it's the uploader
        if (attachment.userId !== userId) {
            throw new ForbiddenException('You do not have permission to delete this attachment');
        }

        // 1. Delete physical file via storage service
        await this.storage.deleteFile(attachment.storagePath);

        // 2. Mark as deleted in DB (Soft delete or Hard delete)
        // We'll hard delete here for cleanliness, or we could soft delete
        await this.prisma.attachment.delete({
            where: { id: attachmentId },
        });

        return { message: 'Attachment deleted successfully' };
    }

    /**
     * Get all attachments for a specific task
     */
    async getAttachmentsForTask(taskId: string) {
        const attachments = await this.prisma.attachment.findMany({
            where: {
                taskId,
                deletedAt: null
            },
            orderBy: { createdAt: 'desc' }
        });

        // Populate URLs for all attachments
        return Promise.all(
            attachments.map(async (att) => {
                const url = await this.storage.getSignedUrl(att.storagePath);
                return { ...att, url };
            })
        );
    }
}
