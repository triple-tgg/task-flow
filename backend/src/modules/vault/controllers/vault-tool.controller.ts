import { Controller, Get, Post, Patch, Delete, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { VaultToolService } from '../services/vault-tool.service';
import { CreateToolDto, UpdateToolDto } from '../dto';
import { CurrentUser } from '../../auth/decorators';

@ApiTags('vault-tools')
@ApiBearerAuth()
@Controller('vault/tools')
export class VaultToolController {
    constructor(private readonly toolService: VaultToolService) { }

    @Get()
    @ApiOperation({ summary: 'List vault tools' })
    findAll(
        @Query('page') page?: string,
        @Query('limit') limit?: string,
        @Query('search') search?: string,
        @Query('category') category?: string,
    ) {
        return this.toolService.findAll({
            page: page ? parseInt(page, 10) : undefined,
            limit: limit ? parseInt(limit, 10) : undefined,
            search,
            category,
        });
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get vault tool detail' })
    findById(@Param('id') id: string) {
        return this.toolService.findById(id);
    }

    @Post()
    @ApiOperation({ summary: 'Create vault tool' })
    create(@Body() dto: CreateToolDto, @CurrentUser('id') userId: string) {
        return this.toolService.create(dto, userId);
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Update vault tool' })
    update(@Param('id') id: string, @Body() dto: UpdateToolDto, @CurrentUser('id') userId: string) {
        return this.toolService.update(id, dto, userId);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Soft delete vault tool + cascade' })
    remove(@Param('id') id: string, @CurrentUser('id') userId: string) {
        return this.toolService.remove(id, userId);
    }
}
