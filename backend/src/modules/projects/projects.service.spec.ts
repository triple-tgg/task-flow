import { Test, TestingModule } from '@nestjs/testing';
import { ProjectsService } from './projects.service';
import { PrismaService } from '../../prisma/prisma.service';
import { ForbiddenException } from '@nestjs/common';

describe('ProjectsService', () => {
    let service: ProjectsService;

    const mockPrisma = {
        project: {
            create: jest.fn(),
            findMany: jest.fn(),
            findUnique: jest.fn(),
            update: jest.fn(),
            count: jest.fn(),
        },
        projectMember: {
            findUnique: jest.fn(),
            findMany: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
            count: jest.fn(),
        },
        $transaction: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ProjectsService,
                { provide: PrismaService, useValue: mockPrisma },
            ],
        }).compile();

        service = module.get<ProjectsService>(ProjectsService);
        jest.clearAllMocks();
    });

    describe('create', () => {
        it('should create a project and assign owner role via transaction', async () => {
            const mockProject = {
                id: 'proj-1',
                name: 'Test Project',
                description: 'A test project',
                members: [
                    { userId: 'user-1', role: 'owner', user: { id: 'user-1', name: 'Owner' } },
                ],
            };
            // $transaction receives a callback — we run it with a tx proxy
            mockPrisma.$transaction.mockImplementation(async (cb: any) => {
                const tx = {
                    project: { create: jest.fn().mockResolvedValue(mockProject) },
                    projectMember: { create: jest.fn().mockResolvedValue({}) },
                };
                return cb(tx);
            });

            const result = await service.create('user-1', {
                name: 'Test Project',
                description: 'A test project',
            });

            expect(result.name).toBe('Test Project');
            expect(mockPrisma.$transaction).toHaveBeenCalled();
        });
    });

    describe('findByUser', () => {
        it('should return paginated projects for a user', async () => {
            const mockMemberships = [
                {
                    project: { id: 'proj-1', name: 'Project 1', _count: { tasks: 5, members: 2 } },
                    role: 'owner',
                },
            ];
            mockPrisma.projectMember.findMany.mockResolvedValue(mockMemberships);
            mockPrisma.projectMember.count.mockResolvedValue(1);

            const result = await service.findByUser('user-1');

            expect(mockPrisma.projectMember.findMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: expect.objectContaining({ userId: 'user-1' }),
                }),
            );
        });
    });

    describe('addMember', () => {
        it('should throw ForbiddenException if not project owner', async () => {
            mockPrisma.projectMember.findUnique.mockResolvedValue({
                role: 'editor',
            });

            await expect(
                service.addMember('proj-1', 'user-1', 'user-2', 'editor'),
            ).rejects.toThrow(ForbiddenException);
        });
    });

    describe('removeMember', () => {
        it('should throw ForbiddenException if trying to remove the owner', async () => {
            mockPrisma.projectMember.findUnique
                .mockResolvedValueOnce({ role: 'owner' }) // requester is owner
                .mockResolvedValueOnce({ role: 'owner' }); // target is also owner

            await expect(
                service.removeMember('proj-1', 'user-1', 'user-1'),
            ).rejects.toThrow(ForbiddenException);
        });
    });
});
