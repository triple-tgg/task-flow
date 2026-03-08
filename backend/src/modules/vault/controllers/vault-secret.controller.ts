import { Controller, Get, Post, Patch, Delete, Body, Param, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { VaultSecretService } from '../services/vault-secret.service';
import { CreateSecretDto, UpdateSecretDto } from '../dto';
import { CurrentUser } from '../../auth/decorators';
import type { Request } from 'express';

@ApiTags('vault-secrets')
@ApiBearerAuth()
@Controller('vault')
export class VaultSecretController {
    constructor(private readonly secretService: VaultSecretService) { }

    @Get('accounts/:accountId/secrets')
    @ApiOperation({ summary: 'List secret keys for account (NO values)' })
    findByAccount(@Param('accountId') accountId: string) {
        return this.secretService.findByAccount(accountId);
    }

    @Get('secrets/:id/decrypt')
    @ApiOperation({ summary: 'Decrypt a secret (AUDITED)' })
    decrypt(
        @Param('id') id: string,
        @CurrentUser('id') userId: string,
        @Req() req: Request,
    ) {
        return this.secretService.decrypt(id, userId, req.ip);
    }

    @Post('accounts/:accountId/secrets')
    @ApiOperation({ summary: 'Create secret (encrypted on write)' })
    create(
        @Param('accountId') accountId: string,
        @Body() dto: CreateSecretDto,
        @CurrentUser('id') userId: string,
    ) {
        return this.secretService.create(accountId, dto, userId);
    }

    @Patch('secrets/:id')
    @ApiOperation({ summary: 'Update secret value' })
    update(
        @Param('id') id: string,
        @Body() dto: UpdateSecretDto,
        @CurrentUser('id') userId: string,
    ) {
        return this.secretService.update(id, dto, userId);
    }

    @Delete('secrets/:id')
    @ApiOperation({ summary: 'Soft delete secret' })
    remove(@Param('id') id: string, @CurrentUser('id') userId: string) {
        return this.secretService.remove(id, userId);
    }
}
