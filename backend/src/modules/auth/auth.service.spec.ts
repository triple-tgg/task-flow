import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { ConflictException, UnauthorizedException } from '@nestjs/common';

// Mock bcrypt
jest.mock('bcrypt', () => ({
    hash: jest.fn().mockResolvedValue('$2b$10$hashedPassword'),
    compare: jest.fn(),
}));
import * as bcrypt from 'bcrypt';

// Mock uuid
jest.mock('uuid', () => ({
    v4: jest.fn().mockReturnValue('mock-uuid'),
}));

describe('AuthService', () => {
    let service: AuthService;
    let prisma: PrismaService;
    let jwtService: JwtService;

    const mockPrisma = {
        user: {
            findUnique: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
        },
        refreshToken: {
            findFirst: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            updateMany: jest.fn(),
        },
        emailVerificationToken: {
            create: jest.fn(),
            findFirst: jest.fn(),
            deleteMany: jest.fn(),
        },
        passwordResetToken: {
            create: jest.fn(),
            findFirst: jest.fn(),
            update: jest.fn(),
        },
    };

    const mockJwtService = {
        sign: jest.fn().mockReturnValue('mock-jwt-token'),
        signAsync: jest.fn().mockResolvedValue('mock-jwt-token'),
    };

    const mockConfigService = {
        get: jest.fn((key: string) => {
            const config: Record<string, string> = {
                JWT_SECRET: 'test-secret',
                JWT_EXPIRATION: '15m',
                JWT_REFRESH_EXPIRATION_DAYS: '7',
            };
            return config[key];
        }),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AuthService,
                { provide: PrismaService, useValue: mockPrisma },
                { provide: JwtService, useValue: mockJwtService },
                { provide: ConfigService, useValue: mockConfigService },
            ],
        }).compile();

        service = module.get<AuthService>(AuthService);
        prisma = module.get<PrismaService>(PrismaService);
        jwtService = module.get<JwtService>(JwtService);

        // Reset all mocks
        jest.clearAllMocks();
    });

    describe('register', () => {
        it('should register a new user successfully', async () => {
            mockPrisma.user.findUnique.mockResolvedValue(null);
            mockPrisma.user.create.mockResolvedValue({
                id: 'user-1',
                name: 'Test User',
                email: 'test@example.com',
                role: 'user',
            });
            mockPrisma.emailVerificationToken.create.mockResolvedValue({});

            const result = await service.register('Test User', 'test@example.com', 'Password123!');

            expect(result).toHaveProperty('message');
            expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
                where: { email: 'test@example.com' },
            });
            expect(mockPrisma.user.create).toHaveBeenCalled();
        });

        it('should throw ConflictException for duplicate email', async () => {
            mockPrisma.user.findUnique.mockResolvedValue({
                id: 'existing-user',
                email: 'test@example.com',
            });

            await expect(
                service.register('Test', 'test@example.com', 'Password123!'),
            ).rejects.toThrow(ConflictException);
        });
    });

    describe('login', () => {
        const mockUser = {
            id: 'user-1',
            email: 'test@example.com',
            name: 'Test User',
            passwordHash: '$2b$10$hashedPassword',
            emailVerified: true,
            isSuspended: false,
            role: 'user',
        };

        it('should login successfully with valid credentials', async () => {
            mockPrisma.user.findUnique.mockResolvedValue(mockUser);
            (bcrypt.compare as jest.Mock).mockResolvedValue(true);
            mockPrisma.refreshToken.create.mockResolvedValue({});

            const result = await service.login('test@example.com', 'Password123!');

            expect(result).toHaveProperty('accessToken');
            expect(result).toHaveProperty('refreshToken');
            expect(result).toHaveProperty('user');
            expect(result.user.email).toBe('test@example.com');
        });

        it('should throw UnauthorizedException for wrong password', async () => {
            mockPrisma.user.findUnique.mockResolvedValue(mockUser);
            (bcrypt.compare as jest.Mock).mockResolvedValue(false);

            await expect(
                service.login('test@example.com', 'wrong-password'),
            ).rejects.toThrow(UnauthorizedException);
        });

        it('should throw UnauthorizedException for non-existent user', async () => {
            mockPrisma.user.findUnique.mockResolvedValue(null);

            await expect(
                service.login('nonexistent@example.com', 'Password123!'),
            ).rejects.toThrow(UnauthorizedException);
        });
    });

    describe('generateAccessToken', () => {
        it('should generate a JWT access token', () => {
            const user = { id: 'user-1', email: 'test@example.com', role: 'user' };
            const result = service.generateAccessToken(user);

            expect(result).toBe('mock-jwt-token');
            expect(mockJwtService.sign).toHaveBeenCalledWith(
                { sub: user.id, email: user.email, role: user.role },
                expect.any(Object),
            );
        });
    });

    describe('hashToken', () => {
        it('should return a consistent hash for the same token', () => {
            const hash1 = service.hashToken('test-token');
            const hash2 = service.hashToken('test-token');
            expect(hash1).toBe(hash2);
        });

        it('should return different hashes for different tokens', () => {
            const hash1 = service.hashToken('token-1');
            const hash2 = service.hashToken('token-2');
            expect(hash1).not.toBe(hash2);
        });
    });
});
