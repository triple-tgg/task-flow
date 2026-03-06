import {
    Controller,
    Get,
    Post,
    Put,
    Delete,
    Body,
    Param,
    Query,
    HttpCode,
    HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CommentsService } from './comments.service';
import { CreateCommentDto, UpdateCommentDto } from './dto';
import { CurrentUser } from '../auth/decorators';

@ApiTags('comments')
@ApiBearerAuth()
@Controller('tasks/:taskId/comments')
export class CommentsController {
    constructor(private readonly commentsService: CommentsService) { }

    @Post()
    @ApiOperation({ summary: 'Add comment to task' })
    async create(
        @Param('taskId') taskId: string,
        @CurrentUser('id') userId: string,
        @Body() dto: CreateCommentDto,
    ) {
        return this.commentsService.create(taskId, userId, dto.content);
    }

    @Get()
    @ApiOperation({ summary: 'List comments on task' })
    async findAll(
        @Param('taskId') taskId: string,
        @CurrentUser('id') userId: string,
        @Query('page') page?: string,
        @Query('limit') limit?: string,
    ) {
        return this.commentsService.findByTask(
            taskId,
            userId,
            page ? parseInt(page, 10) : 1,
            limit ? parseInt(limit, 10) : 30,
        );
    }

    @Put(':commentId')
    @ApiOperation({ summary: 'Edit comment' })
    async update(
        @Param('commentId') commentId: string,
        @CurrentUser('id') userId: string,
        @Body() dto: UpdateCommentDto,
    ) {
        return this.commentsService.update(commentId, userId, dto.content);
    }

    @Delete(':commentId')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Delete comment' })
    async remove(
        @Param('commentId') commentId: string,
        @CurrentUser('id') userId: string,
    ) {
        return this.commentsService.remove(commentId, userId);
    }
}
