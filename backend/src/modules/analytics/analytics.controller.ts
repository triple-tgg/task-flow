import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AnalyticsService } from './analytics.service';
import { CurrentUser } from '../auth/decorators';

@ApiTags('analytics')
@ApiBearerAuth()
@Controller('analytics')
export class AnalyticsController {
    constructor(private readonly analyticsService: AnalyticsService) { }

    @Get('dashboard')
    @ApiOperation({ summary: 'Get dashboard analytics' })
    async getDashboard(@CurrentUser('id') userId: string) {
        return this.analyticsService.getDashboardStats(userId);
    }

    @Get('trend')
    @ApiOperation({ summary: 'Get 30-day task completion trend' })
    async getTrend(@CurrentUser('id') userId: string) {
        return this.analyticsService.getCompletionTrend(userId);
    }
}
