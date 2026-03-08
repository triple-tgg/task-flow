import { Controller, Get, Post, Patch, Delete, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { VaultAccountService } from '../services/vault-account.service';
import { CreateAccountDto, UpdateAccountDto } from '../dto';
import { CurrentUser } from '../../auth/decorators';

@ApiTags('vault-accounts')
@ApiBearerAuth()
@Controller('vault')
export class VaultAccountController {
    constructor(private readonly accountService: VaultAccountService) { }

    @Get('tools/:toolId/accounts')
    @ApiOperation({ summary: 'List accounts for a tool' })
    findByTool(
        @Param('toolId') toolId: string,
        @Query('page') page?: string,
        @Query('limit') limit?: string,
        @Query('search') search?: string,
    ) {
        return this.accountService.findByTool(toolId, {
            page: page ? parseInt(page, 10) : undefined,
            limit: limit ? parseInt(limit, 10) : undefined,
            search,
        });
    }

    @Get('projects/:projectId/accounts')
    @ApiOperation({ summary: 'List accounts for a project' })
    findByProject(
        @Param('projectId') projectId: string,
        @Query('page') page?: string,
        @Query('limit') limit?: string,
        @Query('search') search?: string,
    ) {
        return this.accountService.findByProject(projectId, {
            page: page ? parseInt(page, 10) : undefined,
            limit: limit ? parseInt(limit, 10) : undefined,
            search,
        });
    }

    @Get('accounts/:id')
    @ApiOperation({ summary: 'Get account detail (secret keys only, NO values)' })
    findById(@Param('id') id: string) {
        return this.accountService.findById(id);
    }

    @Post('tools/:toolId/accounts')
    @ApiOperation({ summary: 'Create account for a tool' })
    create(
        @Param('toolId') toolId: string,
        @Body() dto: CreateAccountDto,
        @CurrentUser('id') userId: string,
    ) {
        return this.accountService.create(toolId, dto, userId);
    }

    @Patch('accounts/:id')
    @ApiOperation({ summary: 'Update account metadata' })
    update(
        @Param('id') id: string,
        @Body() dto: UpdateAccountDto,
        @CurrentUser('id') userId: string,
    ) {
        return this.accountService.update(id, dto, userId);
    }

    @Delete('accounts/:id')
    @ApiOperation({ summary: 'Soft delete account + cascade secrets' })
    remove(@Param('id') id: string, @CurrentUser('id') userId: string) {
        return this.accountService.remove(id, userId);
    }
}
