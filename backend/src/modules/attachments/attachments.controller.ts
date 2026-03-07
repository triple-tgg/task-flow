import {
    Controller,
    Post,
    Get,
    Delete,
    Param,
    UseInterceptors,
    UploadedFile,
    UseGuards,
    ParseFilePipe,
    MaxFileSizeValidator,
    FileTypeValidator,
    Req,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiBearerAuth, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { SkipThrottle } from '@nestjs/throttler';
import { AttachmentsService } from './attachments.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Attachments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('attachments')
export class AttachmentsController {
    constructor(private readonly attachmentsService: AttachmentsService) { }

    @Post('task/:taskId')
    @SkipThrottle()
    @ApiConsumes('multipart/form-data')
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                file: {
                    type: 'string',
                    format: 'binary',
                },
            },
        },
    })
    @UseInterceptors(FileInterceptor('file')) // 'file' is the field name in the form data
    async uploadAttachment(
        @Param('taskId') taskId: string,
        @UploadedFile(
            new ParseFilePipe({
                validators: [
                    // Example: Max 10MB per file
                    new MaxFileSizeValidator({ maxSize: 10 * 1024 * 1024 }),
                    // Restrict to safe file types
                    new FileTypeValidator({ fileType: '.(png|jpeg|jpg|webp|pdf|doc|docx|xls|xlsx|csv|txt)' }),
                ],
            }),
        )
        file: Express.Multer.File,
        @Req() req: any,
    ) {
        // The JWT Guard attaches the user payload to req.user
        const userId = req.user.id;
        return this.attachmentsService.uploadAttachment(taskId, userId, file);
    }

    @Get('task/:taskId')
    async getTasksAttachments(@Param('taskId') taskId: string) {
        return this.attachmentsService.getAttachmentsForTask(taskId);
    }

    @Get(':id')
    async getAttachment(@Param('id') id: string) {
        return this.attachmentsService.getAttachment(id);
    }

    @Delete(':id')
    async deleteAttachment(@Param('id') id: string, @Req() req: any) {
        const userId = req.user.id;
        return this.attachmentsService.deleteAttachment(id, userId);
    }
}
