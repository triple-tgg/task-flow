"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var AuthService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const config_1 = require("@nestjs/config");
const bcrypt = __importStar(require("bcrypt"));
const crypto = __importStar(require("crypto"));
const prisma_service_1 = require("../../prisma/prisma.service");
let AuthService = AuthService_1 = class AuthService {
    prisma;
    jwtService;
    configService;
    logger = new common_1.Logger(AuthService_1.name);
    constructor(prisma, jwtService, configService) {
        this.prisma = prisma;
        this.jwtService = jwtService;
        this.configService = configService;
    }
    async register(name, email, password) {
        if (password.toLowerCase() === email.toLowerCase()) {
            throw new common_1.HttpException({
                error: 'VALIDATION_ERROR',
                message: 'Password cannot be the same as email',
                details: {
                    fields: [{ field: 'password', message: 'Password cannot be the same as email' }],
                },
            }, common_1.HttpStatus.BAD_REQUEST);
        }
        const existingUser = await this.prisma.user.findUnique({
            where: { email: email.toLowerCase() },
        });
        if (existingUser) {
            throw new common_1.ConflictException({
                error: 'EMAIL_ALREADY_EXISTS',
                message: 'An account with this email already exists',
            });
        }
        const passwordHash = await bcrypt.hash(password, 12);
        const isDev = process.env.NODE_ENV === 'development';
        const user = await this.prisma.user.create({
            data: {
                name,
                email: email.toLowerCase(),
                passwordHash,
                emailVerified: isDev,
            },
        });
        const verificationToken = crypto.randomUUID();
        const tokenHash = this.hashToken(verificationToken);
        await this.prisma.emailVerificationToken.create({
            data: {
                userId: user.id,
                tokenHash,
                expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
            },
        });
        this.logger.log(`[EMAIL STUB] Verification email for ${email}: /verify-email?token=${verificationToken}`);
        return {
            message: 'Registration successful. Verification email sent.',
            userId: user.id,
        };
    }
    async googleLogin(googleProfile, userAgent, ipAddress) {
        const { googleId, email, name, picture } = googleProfile;
        let oauthAccount = await this.prisma.oAuthAccount.findUnique({
            where: {
                provider_providerAccountId: {
                    provider: 'google',
                    providerAccountId: googleId,
                },
            },
            include: { user: true },
        });
        let user;
        if (oauthAccount) {
            user = oauthAccount.user;
        }
        else {
            const existingUser = await this.prisma.user.findUnique({
                where: { email: email.toLowerCase() },
            });
            if (existingUser) {
                await this.prisma.oAuthAccount.create({
                    data: {
                        userId: existingUser.id,
                        provider: 'google',
                        providerAccountId: googleId,
                    },
                });
                if (!existingUser.avatarUrl && picture) {
                    await this.prisma.user.update({
                        where: { id: existingUser.id },
                        data: { avatarUrl: picture, emailVerified: true },
                    });
                }
                user = existingUser;
            }
            else {
                user = await this.prisma.user.create({
                    data: {
                        name,
                        email: email.toLowerCase(),
                        avatarUrl: picture,
                        authProvider: 'google',
                        emailVerified: true,
                    },
                });
                await this.prisma.oAuthAccount.create({
                    data: {
                        userId: user.id,
                        provider: 'google',
                        providerAccountId: googleId,
                    },
                });
            }
        }
        if (user.isSuspended) {
            throw new common_1.ForbiddenException({
                error: 'FORBIDDEN',
                message: 'Your account has been suspended',
            });
        }
        const accessToken = this.generateAccessToken(user);
        const { refreshToken, refreshTokenHash } = this.generateRefreshToken();
        await this.prisma.refreshToken.create({
            data: {
                userId: user.id,
                tokenHash: refreshTokenHash,
                expiresAt: new Date(Date.now() +
                    (this.configService.get('JWT_REFRESH_EXPIRATION_DAYS') || 7) *
                        24 * 60 * 60 * 1000),
                userAgent,
                ipAddress,
            },
        });
        return {
            accessToken,
            refreshToken,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                avatarUrl: user.avatarUrl,
            },
        };
    }
    async verifyEmail(token) {
        const tokenHash = this.hashToken(token);
        const record = await this.prisma.emailVerificationToken.findFirst({
            where: { tokenHash },
            include: { user: true },
        });
        if (!record) {
            throw new common_1.UnauthorizedException({
                error: 'TOKEN_INVALID',
                message: 'Invalid verification token',
            });
        }
        if (record.expiresAt < new Date()) {
            throw new common_1.GoneException({
                error: 'VERIFICATION_TOKEN_EXPIRED',
                message: 'Verification token has expired',
            });
        }
        await this.prisma.$transaction([
            this.prisma.user.update({
                where: { id: record.userId },
                data: { emailVerified: true },
            }),
            this.prisma.emailVerificationToken.delete({
                where: { id: record.id },
            }),
        ]);
        return { message: 'Email verified successfully' };
    }
    async resendVerification(email) {
        const user = await this.prisma.user.findUnique({
            where: { email: email.toLowerCase() },
        });
        if (!user || user.emailVerified) {
            return { message: 'If this email is registered and unverified, a verification email has been sent.' };
        }
        await this.prisma.emailVerificationToken.deleteMany({
            where: { userId: user.id },
        });
        const verificationToken = crypto.randomUUID();
        const tokenHash = this.hashToken(verificationToken);
        await this.prisma.emailVerificationToken.create({
            data: {
                userId: user.id,
                tokenHash,
                expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
            },
        });
        this.logger.log(`[EMAIL STUB] Resent verification for ${email}: /verify-email?token=${verificationToken}`);
        return { message: 'If this email is registered and unverified, a verification email has been sent.' };
    }
    async login(email, password, userAgent, ipAddress) {
        const user = await this.prisma.user.findUnique({
            where: { email: email.toLowerCase() },
        });
        if (!user) {
            throw new common_1.UnauthorizedException({
                error: 'INVALID_CREDENTIALS',
                message: 'Invalid email or password',
            });
        }
        if (!user.emailVerified && process.env.NODE_ENV !== 'development') {
            throw new common_1.ForbiddenException({
                error: 'EMAIL_NOT_VERIFIED',
                message: 'Please verify your email before logging in',
            });
        }
        if (user.isSuspended) {
            throw new common_1.ForbiddenException({
                error: 'FORBIDDEN',
                message: 'Your account has been suspended',
            });
        }
        if (!user.passwordHash) {
            throw new common_1.UnauthorizedException({
                error: 'OAUTH_ONLY',
                message: 'This account uses Google sign-in. Please use "Continue with Google" to log in.',
            });
        }
        const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
        if (!isPasswordValid) {
            throw new common_1.UnauthorizedException({
                error: 'INVALID_CREDENTIALS',
                message: 'Invalid email or password',
            });
        }
        const accessToken = this.generateAccessToken(user);
        const { refreshToken, refreshTokenHash } = this.generateRefreshToken();
        await this.prisma.refreshToken.create({
            data: {
                userId: user.id,
                tokenHash: refreshTokenHash,
                expiresAt: new Date(Date.now() +
                    (this.configService.get('JWT_REFRESH_EXPIRATION_DAYS') || 7) *
                        24 * 60 * 60 * 1000),
                userAgent,
                ipAddress,
            },
        });
        return {
            accessToken,
            refreshToken,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
            },
        };
    }
    async refreshTokens(oldRefreshToken, userAgent, ipAddress) {
        const tokenHash = this.hashToken(oldRefreshToken);
        const storedToken = await this.prisma.refreshToken.findFirst({
            where: { tokenHash },
            include: { user: true },
        });
        if (!storedToken) {
            throw new common_1.UnauthorizedException({
                error: 'TOKEN_INVALID',
                message: 'Invalid refresh token',
            });
        }
        if (storedToken.isRevoked) {
            this.logger.warn(`[SECURITY] Refresh token reuse detected for user ${storedToken.userId}. Revoking all tokens.`);
            await this.prisma.refreshToken.updateMany({
                where: { userId: storedToken.userId },
                data: { isRevoked: true },
            });
            throw new common_1.UnauthorizedException({
                error: 'REFRESH_TOKEN_REUSE',
                message: 'Security breach detected. All sessions have been revoked.',
            });
        }
        if (storedToken.expiresAt < new Date()) {
            throw new common_1.UnauthorizedException({
                error: 'TOKEN_EXPIRED',
                message: 'Refresh token has expired',
            });
        }
        const accessToken = this.generateAccessToken(storedToken.user);
        const { refreshToken, refreshTokenHash } = this.generateRefreshToken();
        await this.prisma.$transaction([
            this.prisma.refreshToken.update({
                where: { id: storedToken.id },
                data: { isRevoked: true },
            }),
            this.prisma.refreshToken.create({
                data: {
                    userId: storedToken.userId,
                    tokenHash: refreshTokenHash,
                    expiresAt: new Date(Date.now() +
                        (this.configService.get('JWT_REFRESH_EXPIRATION_DAYS') || 7) *
                            24 * 60 * 60 * 1000),
                    userAgent,
                    ipAddress,
                },
            }),
        ]);
        return {
            accessToken,
            refreshToken,
            user: {
                id: storedToken.user.id,
                name: storedToken.user.name,
                email: storedToken.user.email,
                role: storedToken.user.role,
            },
        };
    }
    async logout(refreshToken) {
        const tokenHash = this.hashToken(refreshToken);
        await this.prisma.refreshToken.updateMany({
            where: { tokenHash },
            data: { isRevoked: true },
        });
        return { message: 'Logged out successfully' };
    }
    async forgotPassword(email) {
        const user = await this.prisma.user.findUnique({
            where: { email: email.toLowerCase() },
        });
        const responseMessage = 'If this email is registered, you will receive a password reset link.';
        if (!user) {
            return { message: responseMessage };
        }
        const recentTokens = await this.prisma.passwordResetToken.count({
            where: {
                userId: user.id,
                createdAt: { gte: new Date(Date.now() - 60 * 60 * 1000) },
            },
        });
        if (recentTokens >= 3) {
            throw new common_1.HttpException({
                error: 'RATE_LIMIT_EXCEEDED',
                message: 'Too many password reset requests. Please try again later.',
            }, common_1.HttpStatus.TOO_MANY_REQUESTS);
        }
        const rawToken = crypto.randomBytes(32).toString('hex');
        const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
        await this.prisma.passwordResetToken.create({
            data: {
                userId: user.id,
                tokenHash,
                expiresAt: new Date(Date.now() + 60 * 60 * 1000),
            },
        });
        this.logger.log(`[EMAIL STUB] Password reset for ${email}: /reset-password?token=${rawToken}`);
        return { message: responseMessage };
    }
    async validateResetToken(token) {
        const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
        const record = await this.prisma.passwordResetToken.findFirst({
            where: { tokenHash, usedAt: null },
        });
        if (!record) {
            return { valid: false, message: 'Invalid reset token' };
        }
        if (record.expiresAt < new Date()) {
            return { valid: false, message: 'Reset token has expired' };
        }
        return { valid: true };
    }
    async resetPassword(token, newPassword) {
        const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
        const record = await this.prisma.passwordResetToken.findFirst({
            where: { tokenHash, usedAt: null },
            include: { user: true },
        });
        if (!record) {
            throw new common_1.UnauthorizedException({
                error: 'TOKEN_INVALID',
                message: 'Invalid reset token',
            });
        }
        if (record.expiresAt < new Date()) {
            throw new common_1.GoneException({
                error: 'RESET_TOKEN_EXPIRED',
                message: 'Password reset token has expired',
            });
        }
        if (newPassword.toLowerCase() === record.user.email.toLowerCase()) {
            throw new common_1.HttpException({
                error: 'VALIDATION_ERROR',
                message: 'Password cannot be the same as email',
            }, common_1.HttpStatus.BAD_REQUEST);
        }
        const passwordHash = await bcrypt.hash(newPassword, 12);
        await this.prisma.$transaction([
            this.prisma.user.update({
                where: { id: record.userId },
                data: { passwordHash },
            }),
            this.prisma.passwordResetToken.update({
                where: { id: record.id },
                data: { usedAt: new Date() },
            }),
            this.prisma.refreshToken.updateMany({
                where: { userId: record.userId },
                data: { isRevoked: true },
            }),
        ]);
        return { message: 'Password reset successfully. Please log in with your new password.' };
    }
    generateAccessToken(user) {
        const payload = { sub: user.id, email: user.email, role: user.role, name: user.name || '' };
        const secret = this.configService.get('JWT_SECRET');
        const expiresIn = this.configService.get('JWT_ACCESS_EXPIRATION') || '15m';
        return this.jwtService.sign(payload, {
            secret,
            expiresIn: expiresIn,
        });
    }
    generateRefreshToken() {
        const refreshToken = crypto.randomUUID();
        const refreshTokenHash = this.hashToken(refreshToken);
        return { refreshToken, refreshTokenHash };
    }
    hashToken(token) {
        return crypto.createHash('sha256').update(token).digest('hex');
    }
    async findUserById(id) {
        return this.prisma.user.findUnique({
            where: { id },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                emailVerified: true,
                isSuspended: true,
            },
        });
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = AuthService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        jwt_1.JwtService,
        config_1.ConfigService])
], AuthService);
//# sourceMappingURL=auth.service.js.map