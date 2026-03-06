import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { SearchService } from './search.service';
import { CurrentUser } from '../auth/decorators';

@ApiTags('search')
@ApiBearerAuth()
@Controller('search')
export class SearchController {
    constructor(private readonly searchService: SearchService) { }

    @Get()
    @ApiOperation({ summary: 'Global search across tasks and projects' })
    async search(
        @CurrentUser('id') userId: string,
        @Query('q') query: string,
        @Query('limit') limit?: string,
    ) {
        return this.searchService.globalSearch(
            userId,
            query,
            limit ? parseInt(limit, 10) : 20,
        );
    }
}
