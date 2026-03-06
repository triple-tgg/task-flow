import { ProjectsService } from './projects.service';
import { CreateProjectDto, UpdateProjectDto, AddMemberDto, UpdateMemberRoleDto } from './dto';
export declare class ProjectsController {
    private readonly projectsService;
    constructor(projectsService: ProjectsService);
    create(userId: string, dto: CreateProjectDto): Promise<{
        members: {
            userId: string;
            role: string;
        }[];
        id: string;
        name: string;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
    }>;
    findAll(userId: string, page?: string, limit?: string): Promise<{
        data: {
            myRole: string;
            taskStats: {
                total: number;
                done: number;
                overdue: number;
            };
            id: string;
            name: string;
            description: string | null;
            createdAt: Date;
            updatedAt: Date;
            _count: {
                members: number;
                tasks: number;
            };
        }[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    findOne(id: string, userId: string): Promise<{
        myRole: string;
        members: ({
            user: {
                id: string;
                name: string;
                email: string;
            };
        } & {
            id: string;
            projectId: string;
            userId: string;
            role: string;
            joinedAt: Date;
        })[];
        _count: {
            tasks: number;
        };
        id: string;
        name: string;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
    }>;
    update(id: string, userId: string, dto: UpdateProjectDto): Promise<{
        id: string;
        name: string;
        description: string | null;
        updatedAt: Date;
    }>;
    remove(id: string, userId: string): Promise<{
        message: string;
    }>;
    addMember(projectId: string, requesterId: string, dto: AddMemberDto): Promise<{
        user: {
            id: string;
            name: string;
            email: string;
        };
    } & {
        id: string;
        projectId: string;
        userId: string;
        role: string;
        joinedAt: Date;
    }>;
    updateMemberRole(projectId: string, targetUserId: string, requesterId: string, dto: UpdateMemberRoleDto): Promise<{
        user: {
            id: string;
            name: string;
            email: string;
        };
    } & {
        id: string;
        projectId: string;
        userId: string;
        role: string;
        joinedAt: Date;
    }>;
    removeMember(projectId: string, targetUserId: string, requesterId: string): Promise<{
        message: string;
    }>;
}
