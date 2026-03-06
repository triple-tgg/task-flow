import { SearchService } from './search.service';
export declare class SearchController {
    private readonly searchService;
    constructor(searchService: SearchService);
    search(userId: string, query: string, limit?: string): Promise<{
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
