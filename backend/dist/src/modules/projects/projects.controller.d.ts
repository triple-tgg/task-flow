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
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        description: string | null;
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
            createdAt: Date;
            updatedAt: Date;
            _count: {
                members: number;
                tasks: number;
            };
            description: string | null;
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
        _count: {
            tasks: number;
        };
        members: ({
            user: {
                id: string;
                name: string;
                email: string;
            };
        } & {
            id: string;
            role: string;
            userId: string;
            projectId: string;
            joinedAt: Date;
        })[];
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        description: string | null;
    }>;
    update(id: string, userId: string, dto: UpdateProjectDto): Promise<{
        id: string;
        name: string;
        updatedAt: Date;
        description: string | null;
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
        role: string;
        userId: string;
        projectId: string;
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
        role: string;
        userId: string;
        projectId: string;
        joinedAt: Date;
    }>;
    removeMember(projectId: string, targetUserId: string, requesterId: string): Promise<{
        message: string;
    }>;
}
