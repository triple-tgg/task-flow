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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AccessGroupsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../prisma/prisma.service");
let AccessGroupsService = class AccessGroupsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAllByProject(projectId) {
        return this.prisma.accessGroup.findMany({
            where: { projectId },
            include: {
                links: {
                    orderBy: { createdAt: 'asc' }
                }
            },
            orderBy: { createdAt: 'asc' }
        });
    }
    async createGroup(projectId, data) {
        const project = await this.prisma.project.findUnique({ where: { id: projectId } });
        if (!project)
            throw new common_1.NotFoundException('Project not found');
        return this.prisma.accessGroup.create({
            data: {
                projectId,
                name: data.name,
                description: data.description,
            },
            include: { links: true }
        });
    }
    async updateGroup(groupId, data) {
        const group = await this.prisma.accessGroup.findUnique({ where: { id: groupId } });
        if (!group)
            throw new common_1.NotFoundException('Access Group not found');
        return this.prisma.accessGroup.update({
            where: { id: groupId },
            data,
            include: { links: true }
        });
    }
    async deleteGroup(groupId) {
        return this.prisma.accessGroup.delete({
            where: { id: groupId }
        });
    }
    async createLink(groupId, data) {
        const group = await this.prisma.accessGroup.findUnique({ where: { id: groupId } });
        if (!group)
            throw new common_1.NotFoundException('Access Group not found');
        return this.prisma.accessLink.create({
            data: {
                groupId,
                name: data.name,
                url: data.url,
                description: data.description
            }
        });
    }
    async updateLink(linkId, data) {
        const link = await this.prisma.accessLink.findUnique({ where: { id: linkId } });
        if (!link)
            throw new common_1.NotFoundException('Access Link not found');
        return this.prisma.accessLink.update({
            where: { id: linkId },
            data
        });
    }
    async deleteLink(linkId) {
        return this.prisma.accessLink.delete({
            where: { id: linkId }
        });
    }
};
exports.AccessGroupsService = AccessGroupsService;
exports.AccessGroupsService = AccessGroupsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AccessGroupsService);
//# sourceMappingURL=access-groups.service.js.map