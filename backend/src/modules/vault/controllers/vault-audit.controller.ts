import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { VaultAuditService } from '../services/vault-audit.service';
import { VaultAction } from '@prisma/client';

@ApiTags('vault-audit')
@ApiBearerAuth()
@Controller('vault/audit')
export class VaultAuditController {
    constructor(private readonly auditService: VaultAuditService) { }

    @Get()
    @ApiOperation({ summary: 'List vault audit logs' })
    findAll(
        @Query('page') page?: string,
        @Query('limit') limit?: string,
        @Query('userId') userId?: string,
        @Query('action') action?: VaultAction,
        @Query('entityType') entityType?: string,
    ) {
        return this.auditService.findAll({
            page: page ? parseInt(page, 10) : undefined,
            limit: limit ? parseInt(limit, 10) : undefined,
            userId,
            action,
            entityType,
        });
    }
}
