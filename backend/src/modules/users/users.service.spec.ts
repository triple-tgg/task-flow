import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { PrismaService } from '../../prisma/prisma.service';
import {
    NotFoundException,
    UnauthorizedException,
    ForbiddenException,
} from '@nestjs/common';

// Mock bcrypt
jest.mock('bcrypt', () => ({
    hash: jest.fn().mockResolvedValue('$2b$12$newHashedPassword'),
    compare: jest.fn(),
}));
import * as bcrypt from 'bcrypt';

describe('UsersService', () => {
    let service: UsersService;

    const mockUser = {
        id: 'user-1',
        name: 'Test User',
        email: 'test@example.com',
        passwordHash: '$2b$10$hashedPassword',
        role: 'user',
        emailVerified: true,
        isSuspended: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
    };

    const mockPrisma = {
        user: {
            findUnique: jest.fn(),
            findMany: jest.fn(),
            update: jest.fn(),
            count: jest.fn(),
        },
        refreshToken: {
            updateMany: jest.fn(),
        },
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                UsersService,
                { provide: PrismaService, useValue: mockPrisma },
            ],
        }).compile();

        service = module.get<UsersService>(UsersService);
        jest.clearAllMocks();
    });

    describe('findById', () => {
        it('should return user when found', async () => {
            mockPrisma.user.findUnique.mockResolvedValue({
                id: 'user-1',
                name: 'Test User',
                email: 'test@example.com',
                role: 'user',
                emailVerified: true,
                createdAt: mockUser.createdAt,
                updatedAt: mockUser.updatedAt,
            });

            const result = await service.findById('user-1');

            expect(result.id).toBe('user-1');
            expect(result.name).toBe('Test User');
        });

        it('should throw NotFoundException when user not found', async () => {
            mockPrisma.user.findUnique.mockResolvedValue(null);

            await expect(service.findById('non-existent')).rejects.toThrow(
                NotFoundException,
            );
        });
    });

    describe('updateProfile', () => {
        it('should update and return user profile', async () => {
            mockPrisma.user.update.mockResolvedValue({
                id: 'user-1',
                name: 'Updated Name',
                email: 'test@example.com',
                role: 'user',
            });

            const result = await service.updateProfile('user-1', {
                name: 'Updated Name',
            });

            expect(result.name).toBe('Updated Name');
            expect(mockPrisma.user.update).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: { id: 'user-1' },
                    data: { name: 'Updated Name' },
                }),
            );
        });
    });

    describe('changePassword', () => {
        it('should change password successfully', async () => {
            mockPrisma.user.findUnique.mockResolvedValue(mockUser);
            (bcrypt.compare as jest.Mock).mockResolvedValue(true);
            mockPrisma.user.update.mockResolvedValue({});

            const result = await service.changePassword(
                'user-1',
                'OldPassword123!',
                'NewPassword456!',
            );

            expect(result.message).toBe('Password changed successfully');
            expect(mockPrisma.user.update).toHaveBeenCalledWith(
                expect.objectContaining({
                    data: { passwordHash: '$2b$12$newHashedPassword' },
                }),
            );
        });

        it('should throw NotFoundException when user not found', async () => {
            mockPrisma.user.findUnique.mockResolvedValue(null);

            await expect(
                service.changePassword('non-existent', 'old', 'new'),
            ).rejects.toThrow(NotFoundException);
        });

        it('should throw UnauthorizedException for wrong current password', async () => {
            mockPrisma.user.findUnique.mockResolvedValue(mockUser);
            (bcrypt.compare as jest.Mock).mockResolvedValue(false);

            await expect(
                service.changePassword('user-1', 'WrongPassword', 'NewPass'),
            ).rejects.toThrow(UnauthorizedException);
        });

        it('should throw ForbiddenException when new password equals email', async () => {
            mockPrisma.user.findUnique.mockResolvedValue(mockUser);
            (bcrypt.compare as jest.Mock).mockResolvedValue(true);

            await expect(
                service.changePassword('user-1', 'OldPassword', 'test@example.com'),
            ).rejects.toThrow(ForbiddenException);
        });
    });

    describe('findAll', () => {
        it('should return paginated users list', async () => {
            const users = [
                { id: 'user-1', name: 'User 1', email: 'a@example.com', role: 'user' },
                { id: 'user-2', name: 'User 2', email: 'b@example.com', role: 'admin' },
            ];
            mockPrisma.user.findMany.mockResolvedValue(users);
            mockPrisma.user.count.mockResolvedValue(2);

            const result = await service.findAll(1, 20);

            expect(result.data).toHaveLength(2);
            expect(result.meta.total).toBe(2);
            expect(result.meta.page).toBe(1);
            expect(result.meta.totalPages).toBe(1);
        });

        it('should calculate pagination correctly', async () => {
            mockPrisma.user.findMany.mockResolvedValue([]);
            mockPrisma.user.count.mockResolvedValue(45);

            const result = await service.findAll(3, 10);

            expect(result.meta.page).toBe(3);
            expect(result.meta.totalPages).toBe(5);
            expect(mockPrisma.user.findMany).toHaveBeenCalledWith(
                expect.objectContaining({ skip: 20, take: 10 }),
            );
        });
    });

    describe('toggleSuspension', () => {
        it('should suspend user and revoke all refresh tokens', async () => {
            mockPrisma.user.findUnique.mockResolvedValue(mockUser);
            mockPrisma.user.update.mockResolvedValue({});
            mockPrisma.refreshToken.updateMany.mockResolvedValue({ count: 3 });

            const result = await service.toggleSuspension('user-1', true);

            expect(result.message).toBe('User suspended');
            expect(mockPrisma.refreshToken.updateMany).toHaveBeenCalledWith({
                where: { userId: 'user-1', isRevoked: false },
                data: { isRevoked: true },
            });
        });

        it('should unsuspend user without revoking tokens', async () => {
            mockPrisma.user.findUnique.mockResolvedValue(mockUser);
            mockPrisma.user.update.mockResolvedValue({});

            const result = await service.toggleSuspension('user-1', false);

            expect(result.message).toBe('User unsuspended');
            expect(mockPrisma.refreshToken.updateMany).not.toHaveBeenCalled();
        });

        it('should throw NotFoundException when user not found', async () => {
            mockPrisma.user.findUnique.mockResolvedValue(null);

            await expect(
                service.toggleSuspension('non-existent', true),
            ).rejects.toThrow(NotFoundException);
        });
    });
});
