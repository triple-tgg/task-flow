import { UsersService } from './users.service';
import { UpdateProfileDto, ChangePasswordDto } from './dto';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    getProfile(userId: string): Promise<{
        id: string;
        email: string;
        name: string;
        emailVerified: boolean;
        role: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    updateProfile(userId: string, dto: UpdateProfileDto): Promise<{
        id: string;
        email: string;
        name: string;
        role: string;
    }>;
    changePassword(userId: string, dto: ChangePasswordDto): Promise<{
        message: string;
    }>;
    findAll(page?: string, limit?: string): Promise<{
        data: {
            id: string;
            email: string;
            name: string;
            emailVerified: boolean;
            role: string;
            isSuspended: boolean;
            createdAt: Date;
        }[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    findOne(id: string): Promise<{
        id: string;
        email: string;
        name: string;
        emailVerified: boolean;
        role: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    suspend(id: string): Promise<{
        message: string;
    }>;
    unsuspend(id: string): Promise<{
        message: string;
    }>;
}
