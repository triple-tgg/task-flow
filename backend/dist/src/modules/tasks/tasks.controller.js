"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TasksController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const tasks_service_1 = require("./tasks.service");
const dto_1 = require("./dto");
const decorators_1 = require("../auth/decorators");
let TasksController = class TasksController {
    tasksService;
    constructor(tasksService) {
        this.tasksService = tasksService;
    }
    async create(projectId, userId, dto) {
        return this.tasksService.create(projectId, userId, dto);
    }
    async findAll(projectId, userId, status, priority, assigneeId, search, page, limit) {
        return this.tasksService.findByProject(projectId, userId, {
            status,
            priority,
            assigneeId,
            search,
            page: page ? parseInt(page, 10) : undefined,
            limit: limit ? parseInt(limit, 10) : undefined,
        });
    }
    async getBoard(projectId, userId) {
        return this.tasksService.getBoard(projectId, userId);
    }
    async findOne(taskId, userId) {
        return this.tasksService.findById(taskId, userId);
    }
    async update(taskId, userId, dto) {
        return this.tasksService.update(taskId, userId, dto);
    }
    async reorder(projectId, userId, dto) {
        return this.tasksService.reorder(projectId, userId, dto.taskId, dto.newPosition, dto.newStatus);
    }
    async updateTags(taskId, userId, tags) {
        return this.tasksService.updateTags(taskId, userId, tags);
    }
    async remove(taskId, userId) {
        return this.tasksService.remove(taskId, userId);
    }
};
exports.TasksController = TasksController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create a task in project' }),
    __param(0, (0, common_1.Param)('projectId')),
    __param(1, (0, decorators_1.CurrentUser)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, dto_1.CreateTaskDto]),
    __metadata("design:returntype", Promise)
], TasksController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'List tasks in project' }),
    __param(0, (0, common_1.Param)('projectId')),
    __param(1, (0, decorators_1.CurrentUser)('id')),
    __param(2, (0, common_1.Query)('status')),
    __param(3, (0, common_1.Query)('priority')),
    __param(4, (0, common_1.Query)('assigneeId')),
    __param(5, (0, common_1.Query)('search')),
    __param(6, (0, common_1.Query)('page')),
    __param(7, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], TasksController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('board'),
    (0, swagger_1.ApiOperation)({ summary: 'Get Kanban board view' }),
    __param(0, (0, common_1.Param)('projectId')),
    __param(1, (0, decorators_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], TasksController.prototype, "getBoard", null);
__decorate([
    (0, common_1.Get)(':taskId'),
    (0, swagger_1.ApiOperation)({ summary: 'Get task details' }),
    __param(0, (0, common_1.Param)('taskId')),
    __param(1, (0, decorators_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], TasksController.prototype, "findOne", null);
__decorate([
    (0, common_1.Put)(':taskId'),
    (0, swagger_1.ApiOperation)({ summary: 'Update task' }),
    __param(0, (0, common_1.Param)('taskId')),
    __param(1, (0, decorators_1.CurrentUser)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, dto_1.UpdateTaskDto]),
    __metadata("design:returntype", Promise)
], TasksController.prototype, "update", null);
__decorate([
    (0, common_1.Post)('reorder'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Reorder task (Kanban drag-drop)' }),
    __param(0, (0, common_1.Param)('projectId')),
    __param(1, (0, decorators_1.CurrentUser)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, dto_1.ReorderTaskDto]),
    __metadata("design:returntype", Promise)
], TasksController.prototype, "reorder", null);
__decorate([
    (0, common_1.Put)(':taskId/tags'),
    (0, swagger_1.ApiOperation)({ summary: 'Update task tags' }),
    __param(0, (0, common_1.Param)('taskId')),
    __param(1, (0, decorators_1.CurrentUser)('id')),
    __param(2, (0, common_1.Body)('tags')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Array]),
    __metadata("design:returntype", Promise)
], TasksController.prototype, "updateTags", null);
__decorate([
    (0, common_1.Delete)(':taskId'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Delete task' }),
    __param(0, (0, common_1.Param)('taskId')),
    __param(1, (0, decorators_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], TasksController.prototype, "remove", null);
exports.TasksController = TasksController = __decorate([
    (0, swagger_1.ApiTags)('tasks'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('projects/:projectId/tasks'),
    __metadata("design:paramtypes", [tasks_service_1.TasksService])
], TasksController);
//# sourceMappingURL=tasks.controller.js.map