import { CommentsService } from './comments.service';
import { CreateCommentDto, UpdateCommentDto } from './dto';
export declare class CommentsController {
    private readonly commentsService;
    constructor(commentsService: CommentsService);
    create(taskId: string, userId: string, dto: CreateCommentDto): Promise<{
        user: {
            id: string;
            name: string;
            email: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        userId: string;
        content: string;
        taskId: string;
    }>;
    findAll(taskId: string, userId: string, page?: string, limit?: string): Promise<{
        data: ({
            user: {
                id: string;
                name: string;
                email: string;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date | null;
            userId: string;
            content: string;
            taskId: string;
        })[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    update(commentId: string, userId: string, dto: UpdateCommentDto): Promise<{
        user: {
            id: string;
            name: string;
            email: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        userId: string;
        content: string;
        taskId: string;
    }>;
    remove(commentId: string, userId: string): Promise<{
        message: string;
    }>;
}
