import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { AccessGroupsService } from '../services/access-groups.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

@Controller('projects/:projectId/access-groups')
@UseGuards(JwtAuthGuard)
export class AccessGroupsController {
    constructor(private readonly accessGroupsService: AccessGroupsService) { }

    @Get()
    findAll(@Param('projectId') projectId: string) {
        return this.accessGroupsService.findAllByProject(projectId);
    }

    @Post()
    createGroup(
        @Param('projectId') projectId: string,
        @Body() data: { name: string; description?: string }
    ) {
        return this.accessGroupsService.createGroup(projectId, data);
    }

    @Patch(':groupId')
    updateGroup(
        @Param('groupId') groupId: string,
        @Body() data: { name?: string; description?: string }
    ) {
        return this.accessGroupsService.updateGroup(groupId, data);
    }

    @Delete(':groupId')
    deleteGroup(@Param('groupId') groupId: string) {
        return this.accessGroupsService.deleteGroup(groupId);
    }

    // --- Links ---

    @Post(':groupId/links')
    createLink(
        @Param('groupId') groupId: string,
        @Body() data: { name: string; url: string; description?: string }
    ) {
        return this.accessGroupsService.createLink(groupId, data);
    }

    @Patch(':groupId/links/:linkId')
    updateLink(
        @Param('linkId') linkId: string,
        @Body() data: { name?: string; url?: string; description?: string }
    ) {
        return this.accessGroupsService.updateLink(linkId, data);
    }

    @Delete(':groupId/links/:linkId')
    deleteLink(@Param('linkId') linkId: string) {
        return this.accessGroupsService.deleteLink(linkId);
    }
}
