import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class AccessGroupsService {
    constructor(private prisma: PrismaService) { }

    async findAllByProject(projectId: string) {
        return this.prisma.accessGroup.findMany({
            where: { projectId },
            include: {
                links: {
                    orderBy: { createdAt: 'asc' }
                }
            },
            orderBy: { createdAt: 'asc' }
        });
    }

    async createGroup(projectId: string, data: { name: string; description?: string }) {
        // Verify project exists
        const project = await this.prisma.project.findUnique({ where: { id: projectId } });
        if (!project) throw new NotFoundException('Project not found');

        return this.prisma.accessGroup.create({
            data: {
                projectId,
                name: data.name,
                description: data.description,
            },
            include: { links: true }
        });
    }

    async updateGroup(groupId: string, data: { name?: string; description?: string }) {
        const group = await this.prisma.accessGroup.findUnique({ where: { id: groupId } });
        if (!group) throw new NotFoundException('Access Group not found');

        return this.prisma.accessGroup.update({
            where: { id: groupId },
            data,
            include: { links: true }
        });
    }

    async deleteGroup(groupId: string) {
        return this.prisma.accessGroup.delete({
            where: { id: groupId }
        });
    }

    // --- Links CRUD ---

    async createLink(groupId: string, data: { name: string; url: string; description?: string }) {
        const group = await this.prisma.accessGroup.findUnique({ where: { id: groupId } });
        if (!group) throw new NotFoundException('Access Group not found');

        return this.prisma.accessLink.create({
            data: {
                groupId,
                name: data.name,
                url: data.url,
                description: data.description
            }
        });
    }

    async updateLink(linkId: string, data: { name?: string; url?: string; description?: string }) {
        const link = await this.prisma.accessLink.findUnique({ where: { id: linkId } });
        if (!link) throw new NotFoundException('Access Link not found');

        return this.prisma.accessLink.update({
            where: { id: linkId },
            data
        });
    }

    async deleteLink(linkId: string) {
        return this.prisma.accessLink.delete({
            where: { id: linkId }
        });
    }
}
