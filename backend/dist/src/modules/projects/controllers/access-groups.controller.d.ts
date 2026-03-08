import { AccessGroupsService } from '../services/access-groups.service';
export declare class AccessGroupsController {
    private readonly accessGroupsService;
    constructor(accessGroupsService: AccessGroupsService);
    findAll(projectId: string): Promise<({
        links: {
            url: string;
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            description: string | null;
            groupId: string;
        }[];
    } & {
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        projectId: string;
    })[]>;
    createGroup(projectId: string, data: {
        name: string;
        description?: string;
    }): Promise<{
        links: {
            url: string;
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            description: string | null;
            groupId: string;
        }[];
    } & {
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        projectId: string;
    }>;
    updateGroup(groupId: string, data: {
        name?: string;
        description?: string;
    }): Promise<{
        links: {
            url: string;
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            description: string | null;
            groupId: string;
        }[];
    } & {
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        projectId: string;
    }>;
    deleteGroup(groupId: string): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        projectId: string;
    }>;
    createLink(groupId: string, data: {
        name: string;
        url: string;
        description?: string;
    }): Promise<{
        url: string;
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        groupId: string;
    }>;
    updateLink(linkId: string, data: {
        name?: string;
        url?: string;
        description?: string;
    }): Promise<{
        url: string;
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        groupId: string;
    }>;
    deleteLink(linkId: string): Promise<{
        url: string;
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        groupId: string;
    }>;
}
