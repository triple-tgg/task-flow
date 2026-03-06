import {
    Controller,
    Get,
    Param,
    Query,
    ForbiddenException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ActivityLogService } from './activity-log.service';
import { CurrentUser } from '../auth/decorators';
import { PrismaService } from '../../prisma/prisma.service';

@ApiTags('activity-log')
@ApiBearerAuth()
@Controller('activity-log')
export class ActivityLogController {
    constructor(
        private readonly activityLogService: ActivityLogService,
        private readonly prisma: PrismaService,
    ) { }

    @Get('me')
    @ApiOperation({ summary: 'Get my recent activity' })
    async getMyActivity(
        @CurrentUser('id') userId: string,
        @Query('page') page?: string,
        @Query('limit') limit?: string,
    ) {
        return this.activityLogService.getByUser(
            userId,
            page ? parseInt(page, 10) : 1,
            limit ? parseInt(limit, 10) : 30,
        );
    }

    @Get('projects/:projectId')
    @ApiOperation({ summary: 'Get project activity log' })
    async getProjectActivity(
        @Param('projectId') projectId: string,
        @CurrentUser('id') userId: string,
        @Query('page') page?: string,
        @Query('limit') limit?: string,
    ) {
        // Verify membership
        const membership = await this.prisma.projectMember.findUnique({
            where: { projectId_userId: { projectId, userId } },
        });
        if (!membership) {
            throw new ForbiddenException({
                error: 'NOT_A_MEMBER',
                message: 'You are not a member of this project',
            });
        }

        return this.activityLogService.getByProject(
            projectId,
            page ? parseInt(page, 10) : 1,
            limit ? parseInt(limit, 10) : 30,
        );
    }
}
