import {
    Controller,
    Get,
    Post,
    Param,
    Query,
    HttpCode,
    HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';
import { CurrentUser } from '../auth/decorators';

@ApiTags('notifications')
@ApiBearerAuth()
@Controller('notifications')
export class NotificationsController {
    constructor(private readonly notificationsService: NotificationsService) { }

    @Get()
    @ApiOperation({ summary: 'List my notifications' })
    async findAll(
        @CurrentUser('id') userId: string,
        @Query('page') page?: string,
        @Query('limit') limit?: string,
    ) {
        return this.notificationsService.findByUser(
            userId,
            page ? parseInt(page, 10) : 1,
            limit ? parseInt(limit, 10) : 30,
        );
    }

    @Post(':id/read')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Mark notification as read' })
    async markRead(
        @Param('id') id: string,
        @CurrentUser('id') userId: string,
    ) {
        return this.notificationsService.markRead(id, userId);
    }

    @Post('read-all')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Mark all notifications as read' })
    async markAllRead(@CurrentUser('id') userId: string) {
        return this.notificationsService.markAllRead(userId);
    }
}
