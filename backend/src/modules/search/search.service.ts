import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class SearchService {
    constructor(private prisma: PrismaService) { }

    async globalSearch(userId: string, query: string, limit = 20) {
        if (!query || query.trim().length < 2) {
            return { tasks: [], projects: [] };
        }

        const searchTerm = query.trim();

        // Get user's project IDs for scoping
        const memberships = await this.prisma.projectMember.findMany({
            where: { userId },
            select: { projectId: true },
        });
        const projectIds = memberships.map((m) => m.projectId);

        if (projectIds.length === 0) {
            return { tasks: [], projects: [] };
        }

        // Search tasks (title + description, case-insensitive)
        const tasks = await this.prisma.task.findMany({
            where: {
                projectId: { in: projectIds },
                deletedAt: null,
                OR: [
                    { title: { contains: searchTerm, mode: 'insensitive' } },
                    { description: { contains: searchTerm, mode: 'insensitive' } },
                ],
            },
            select: {
                id: true,
                title: true,
                status: true,
                priority: true,
                projectId: true,
                project: { select: { name: true } },
                assignee: { select: { id: true, name: true } },
                createdAt: true,
            },
            take: limit,
            orderBy: { updatedAt: 'desc' },
        });

        // Search projects (name + description)
        const projects = await this.prisma.project.findMany({
            where: {
                id: { in: projectIds },
                deletedAt: null,
                OR: [
                    { name: { contains: searchTerm, mode: 'insensitive' } },
                    { description: { contains: searchTerm, mode: 'insensitive' } },
                ],
            },
            select: {
                id: true,
                name: true,
                description: true,
                _count: { select: { tasks: true, members: true } },
            },
            take: limit,
        });

        return { tasks, projects };
    }
}
