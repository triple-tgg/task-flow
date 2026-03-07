"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AttachmentsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const storage_service_1 = require("../storage/storage.service");
let AttachmentsService = class AttachmentsService {
    prisma;
    storage;
    constructor(prisma, storage) {
        this.prisma = prisma;
        this.storage = storage;
    }
    async uploadAttachment(taskId, userId, file) {
        const task = await this.prisma.task.findUnique({
            where: { id: taskId },
        });
        if (!task) {
            throw new common_1.NotFoundException(`Task with ID ${taskId} not found`);
        }
        const fileData = {
            buffer: file.buffer,
            originalname: file.originalname,
            mimetype: file.mimetype,
            size: file.size,
        };
        const folder = `tasks/${taskId}`;
        const savedFile = await this.storage.saveFile(fileData, folder);
        const attachment = await this.prisma.attachment.create({
            data: {
                taskId,
                userId,
                filename: savedFile.filename,
                storagePath: savedFile.path,
                size: savedFile.size,
                mimeType: savedFile.mimeType,
            },
        });
        return {
            ...attachment,
            url: savedFile.url,
        };
    }
    async getAttachment(attachmentId) {
        const attachment = await this.prisma.attachment.findUnique({
            where: { id: attachmentId },
        });
        if (!attachment || attachment.deletedAt) {
            throw new common_1.NotFoundException(`Attachment ${attachmentId} not found`);
        }
        const url = await this.storage.getSignedUrl(attachment.storagePath);
        return {
            ...attachment,
            url,
        };
    }
    async deleteAttachment(attachmentId, userId) {
        const attachment = await this.prisma.attachment.findUnique({
            where: { id: attachmentId },
            include: { task: true },
        });
        if (!attachment || attachment.deletedAt) {
            throw new common_1.NotFoundException(`Attachment ${attachmentId} not found`);
        }
        if (attachment.userId !== userId) {
            throw new common_1.ForbiddenException('You do not have permission to delete this attachment');
        }
        await this.storage.deleteFile(attachment.storagePath);
        await this.prisma.attachment.delete({
            where: { id: attachmentId },
        });
        return { message: 'Attachment deleted successfully' };
    }
    async getAttachmentsForTask(taskId) {
        const attachments = await this.prisma.attachment.findMany({
            where: {
                taskId,
                deletedAt: null
            },
            orderBy: { createdAt: 'desc' }
        });
        return Promise.all(attachments.map(async (att) => {
            const url = await this.storage.getSignedUrl(att.storagePath);
            return { ...att, url };
        }));
    }
};
exports.AttachmentsService = AttachmentsService;
exports.AttachmentsService = AttachmentsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        storage_service_1.StorageService])
], AttachmentsService);
//# sourceMappingURL=attachments.service.js.map