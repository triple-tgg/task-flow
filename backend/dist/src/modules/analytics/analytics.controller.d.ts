import { AnalyticsService } from './analytics.service';
export declare class AnalyticsController {
    private readonly analyticsService;
    constructor(analyticsService: AnalyticsService);
    getDashboard(userId: string): Promise<{
        overview: {
            totalProjects: number;
            totalTasks: number;
            myAssignedTasks: number;
            overdueTasks: number;
            completionRate: number;
        };
        tasksByStatus: {
            todo: number;
            in_progress: number;
            review: number;
            done: number;
        };
        tasksByPriority: {
            low: number;
            medium: number;
            high: number;
            urgent: number;
        };
        recentTasks: never[];
        recentActivity: never[];
    } | {
        overview: {
            totalProjects: number;
            totalTasks: number;
            myAssignedTasks: number;
            overdueTasks: number;
            completionRate: number;
        };
        tasksByStatus: Record<string, number>;
        tasksByPriority: Record<string, number>;
        recentTasks: {
            project: {
                name: string;
            };
            id: string;
            createdAt: Date;
            title: string;
            projectId: string;
            status: string;
            priority: string;
        }[];
        recentActivity: {
            id: string;
            createdAt: Date;
            userId: string;
            projectId: string | null;
            action: string;
            entityType: string;
            entityId: string;
            metadata: import(".prisma/client/runtime/client").JsonValue | null;
        }[];
    }>;
    getTrend(userId: string): Promise<{
        date: string;
        created: number;
        completed: number;
    }[]>;
}
