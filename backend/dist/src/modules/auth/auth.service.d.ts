import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
export declare class AuthService {
    private prisma;
    private jwtService;
    private configService;
    private readonly logger;
    constructor(prisma: PrismaService, jwtService: JwtService, configService: ConfigService);
    register(name: string, email: string, password: string): Promise<{
        message: string;
        userId: string;
    }>;
    googleLogin(googleProfile: {
        googleId: string;
        email: string;
        name: string;
        picture?: string;
    }, userAgent?: string, ipAddress?: string): Promise<{
        accessToken: string;
        refreshToken: `${string}-${string}-${string}-${string}-${string}`;
        user: {
            id: any;
            name: any;
            email: any;
            role: any;
            avatarUrl: any;
        };
    }>;
    verifyEmail(token: string): Promise<{
        message: string;
    }>;
    resendVerification(email: string): Promise<{
        message: string;
    }>;
    login(email: string, password: string, userAgent?: string, ipAddress?: string): Promise<{
        accessToken: string;
        refreshToken: `${string}-${string}-${string}-${string}-${string}`;
        user: {
            id: string;
            name: string;
            email: string;
            role: string;
        };
    }>;
    refreshTokens(oldRefreshToken: string, userAgent?: string, ipAddress?: string): Promise<{
        accessToken: string;
        refreshToken: `${string}-${string}-${string}-${string}-${string}`;
        user: {
            id: string;
            name: string;
            email: string;
            role: string;
        };
    }>;
    logout(refreshToken: string): Promise<{
        message: string;
    }>;
    forgotPassword(email: string): Promise<{
        message: string;
    }>;
    validateResetToken(token: string): Promise<{
        valid: boolean;
        message: string;
    } | {
        valid: boolean;
        message?: undefined;
    }>;
    resetPassword(token: string, newPassword: string): Promise<{
        message: string;
    }>;
    generateAccessToken(user: {
        id: string;
        email: string;
        role: string;
        name?: string;
    }): string;
    private generateRefreshToken;
    hashToken(token: string): string;
    findUserById(id: string): Promise<{
        id: string;
        email: string;
        name: string;
        emailVerified: boolean;
        role: string;
        isSuspended: boolean;
    } | null>;
}
