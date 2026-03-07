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
import { ProjectsService } from './projects.service';
import {
    CreateProjectDto,
    UpdateProjectDto,
    AddMemberDto,
    UpdateMemberRoleDto,
} from './dto';
import { CurrentUser } from '../auth/decorators';
import { Public } from '../auth/decorators';

@ApiTags('projects')
@ApiBearerAuth()
@Controller('projects')
export class ProjectsController {
    constructor(private readonly projectsService: ProjectsService) { }

    // ─── Project CRUD ────────────────────────────────────

    @Post()
    @ApiOperation({ summary: 'Create a new project' })
    async create(
        @CurrentUser('id') userId: string,
        @Body() dto: CreateProjectDto,
    ) {
        return this.projectsService.create(userId, dto);
    }

    @Get()
    @ApiOperation({ summary: 'List my projects' })
    async findAll(
        @CurrentUser('id') userId: string,
        @Query('page') page?: string,
        @Query('limit') limit?: string,
    ) {
        return this.projectsService.findByUser(
            userId,
            page ? parseInt(page, 10) : 1,
            limit ? parseInt(limit, 10) : 20,
        );
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get project details' })
    async findOne(
        @Param('id') id: string,
        @CurrentUser('id') userId: string,
    ) {
        return this.projectsService.findById(id, userId);
    }

    @Put(':id')
    @ApiOperation({ summary: 'Update project' })
    async update(
        @Param('id') id: string,
        @CurrentUser('id') userId: string,
        @Body() dto: UpdateProjectDto,
    ) {
        return this.projectsService.update(id, userId, dto);
    }

    @Delete(':id')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Delete project (owner only)' })
    async remove(
        @Param('id') id: string,
        @CurrentUser('id') userId: string,
    ) {
        return this.projectsService.remove(id, userId);
    }

    // ─── Member Management ───────────────────────────────

    @Post(':id/members')
    @ApiOperation({ summary: 'Add member to project' })
    async addMember(
        @Param('id') projectId: string,
        @CurrentUser('id') requesterId: string,
        @Body() dto: AddMemberDto,
    ) {
        return this.projectsService.addMember(projectId, requesterId, dto.userId, dto.role);
    }

    @Put(':id/members/:userId')
    @ApiOperation({ summary: 'Update member role' })
    async updateMemberRole(
        @Param('id') projectId: string,
        @Param('userId') targetUserId: string,
        @CurrentUser('id') requesterId: string,
        @Body() dto: UpdateMemberRoleDto,
    ) {
        return this.projectsService.updateMemberRole(projectId, requesterId, targetUserId, dto.role);
    }

    @Delete(':id/members/:userId')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Remove member from project' })
    async removeMember(
        @Param('id') projectId: string,
        @Param('userId') targetUserId: string,
        @CurrentUser('id') requesterId: string,
    ) {
        return this.projectsService.removeMember(projectId, requesterId, targetUserId);
    }

    // ─── Share Link ──────────────────────────────────────

    @Post(':id/share')
    @ApiOperation({ summary: 'Enable public share link (owner only)' })
    async enableShare(
        @Param('id') projectId: string,
        @CurrentUser('id') userId: string,
    ) {
        return this.projectsService.generateShareLink(projectId, userId);
    }

    @Delete(':id/share')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Revoke public share link (owner only)' })
    async revokeShare(
        @Param('id') projectId: string,
        @CurrentUser('id') userId: string,
    ) {
        return this.projectsService.revokeShareLink(projectId, userId);
    }

    @Public()
    @Get('public/:token')
    @ApiOperation({ summary: 'View project via public share link (no auth required)' })
    async viewPublic(@Param('token') token: string) {
        return this.projectsService.findByShareToken(token);
    }
}
