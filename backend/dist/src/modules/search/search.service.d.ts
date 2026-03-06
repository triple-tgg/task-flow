import { PrismaService } from '../../prisma/prisma.service';
export declare class SearchService {
    private prisma;
    constructor(prisma: PrismaService);
    globalSearch(userId: string, query: string, limit?: number): Promise<{
        tasks: {
            project: {
                name: string;
            };
            id: string;
            createdAt: Date;
            title: string;
            projectId: string;
            status: string;
            priority: string;
            assignee: {
                id: string;
                name: string;
            } | null;
        }[];
        projects: {
            id: string;
            name: string;
            _count: {
                members: number;
                tasks: number;
            };
            description: string | null;
        }[];
    }>;
}
