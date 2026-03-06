import {
    Controller,
    Get,
    Post,
    Put,
    Delete,
    Body,
    Param,
    Query,
    HttpCode,
    HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { TasksService } from './tasks.service';
import { CreateTaskDto, UpdateTaskDto, ReorderTaskDto } from './dto';
import { CurrentUser } from '../auth/decorators';

@ApiTags('tasks')
@ApiBearerAuth()
@Controller('projects/:projectId/tasks')
export class TasksController {
    constructor(private readonly tasksService: TasksService) { }

    @Post()
    @ApiOperation({ summary: 'Create a task in project' })
    async create(
        @Param('projectId') projectId: string,
        @CurrentUser('id') userId: string,
        @Body() dto: CreateTaskDto,
    ) {
        return this.tasksService.create(projectId, userId, dto);
    }

    @Get()
    @ApiOperation({ summary: 'List tasks in project' })
    async findAll(
        @Param('projectId') projectId: string,
        @CurrentUser('id') userId: string,
        @Query('status') status?: string,
        @Query('priority') priority?: string,
        @Query('assigneeId') assigneeId?: string,
        @Query('search') search?: string,
        @Query('page') page?: string,
        @Query('limit') limit?: string,
    ) {
        return this.tasksService.findByProject(projectId, userId, {
            status,
            priority,
            assigneeId,
            search,
            page: page ? parseInt(page, 10) : undefined,
            limit: limit ? parseInt(limit, 10) : undefined,
        });
    }

    @Get('board')
    @ApiOperation({ summary: 'Get Kanban board view' })
    async getBoard(
        @Param('projectId') projectId: string,
        @CurrentUser('id') userId: string,
    ) {
        return this.tasksService.getBoard(projectId, userId);
    }

    @Get(':taskId')
    @ApiOperation({ summary: 'Get task details' })
    async findOne(
        @Param('taskId') taskId: string,
        @CurrentUser('id') userId: string,
    ) {
        return this.tasksService.findById(taskId, userId);
    }

    @Put(':taskId')
    @ApiOperation({ summary: 'Update task' })
    async update(
        @Param('taskId') taskId: string,
        @CurrentUser('id') userId: string,
        @Body() dto: UpdateTaskDto,
    ) {
        return this.tasksService.update(taskId, userId, dto);
    }

    @Post('reorder')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Reorder task (Kanban drag-drop)' })
    async reorder(
        @Param('projectId') projectId: string,
        @CurrentUser('id') userId: string,
        @Body() dto: ReorderTaskDto,
    ) {
        return this.tasksService.reorder(
            projectId,
            userId,
            dto.taskId,
            dto.newPosition,
            dto.newStatus,
        );
    }

    @Put(':taskId/tags')
    @ApiOperation({ summary: 'Update task tags' })
    async updateTags(
        @Param('taskId') taskId: string,
        @CurrentUser('id') userId: string,
        @Body('tags') tags: string[],
    ) {
        return this.tasksService.updateTags(taskId, userId, tags);
    }

    @Delete(':taskId')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Delete task' })
    async remove(
        @Param('taskId') taskId: string,
        @CurrentUser('id') userId: string,
    ) {
        return this.tasksService.remove(taskId, userId);
    }
}
