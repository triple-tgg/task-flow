import {
    Injectable,
    UnauthorizedException,
    ConflictException,
    ForbiddenException,
    GoneException,
    HttpException,
    HttpStatus,
    Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AuthService {
    private readonly logger = new Logger(AuthService.name);

    constructor(
        private prisma: PrismaService,
        private jwtService: JwtService,
        private configService: ConfigService,
    ) { }

    // ─── Register ─────────────────────────────────────────

    async register(name: string, email: string, password: string) {
        // Check if email is used as password
        if (password.toLowerCase() === email.toLowerCase()) {
            throw new HttpException(
                {
                    error: 'VALIDATION_ERROR',
                    message: 'Password cannot be the same as email',
                    details: {
                        fields: [{ field: 'password', message: 'Password cannot be the same as email' }],
                    },
                },
                HttpStatus.BAD_REQUEST,
            );
        }

        // Check existing email
        const existingUser = await this.prisma.user.findUnique({
            where: { email: email.toLowerCase() },
        });
        if (existingUser) {
            throw new ConflictException({
                error: 'EMAIL_ALREADY_EXISTS',
                message: 'An account with this email already exists',
            });
        }

        // Hash password
        const passwordHash = await bcrypt.hash(password, 12);

        // Create user
        const user = await this.prisma.user.create({
            data: {
                name,
                email: email.toLowerCase(),
                passwordHash,
                emailVerified: false,
            },
        });

        // Create email verification token
        const verificationToken = uuidv4();
        const tokenHash = this.hashToken(verificationToken);

        await this.prisma.emailVerificationToken.create({
            data: {
                userId: user.id,
                tokenHash,
                expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
            },
        });

        // TODO: Send verification email via AWS SES
        this.logger.log(
            `[EMAIL STUB] Verification email for ${email}: /verify-email?token=${verificationToken}`,
        );

        return {
            message: 'Registration successful. Verification email sent.',
            userId: user.id,
        };
    }

    // ─── Verify Email ─────────────────────────────────────

    async verifyEmail(token: string) {
        const tokenHash = this.hashToken(token);

        const record = await this.prisma.emailVerificationToken.findFirst({
            where: { tokenHash },
            include: { user: true },
        });

        if (!record) {
            throw new UnauthorizedException({
                error: 'TOKEN_INVALID',
                message: 'Invalid verification token',
            });
        }

        if (record.expiresAt < new Date()) {
            throw new GoneException({
                error: 'VERIFICATION_TOKEN_EXPIRED',
                message: 'Verification token has expired',
            });
        }

        // Update user emailVerified and delete token
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

    // ─── Resend Verification ──────────────────────────────

    async resendVerification(email: string) {
        const user = await this.prisma.user.findUnique({
            where: { email: email.toLowerCase() },
        });

        if (!user || user.emailVerified) {
            // Don't reveal whether email exists (security)
            return { message: 'If this email is registered and unverified, a verification email has been sent.' };
        }

        // Delete old tokens
        await this.prisma.emailVerificationToken.deleteMany({
            where: { userId: user.id },
        });

        // Create new token
        const verificationToken = uuidv4();
        const tokenHash = this.hashToken(verificationToken);

        await this.prisma.emailVerificationToken.create({
            data: {
                userId: user.id,
                tokenHash,
                expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
            },
        });

        this.logger.log(
            `[EMAIL STUB] Resent verification for ${email}: /verify-email?token=${verificationToken}`,
        );

        return { message: 'If this email is registered and unverified, a verification email has been sent.' };
    }

    // ─── Login ────────────────────────────────────────────

    async login(email: string, password: string, userAgent?: string, ipAddress?: string) {
        const user = await this.prisma.user.findUnique({
            where: { email: email.toLowerCase() },
        });

        if (!user) {
            throw new UnauthorizedException({
                error: 'INVALID_CREDENTIALS',
                message: 'Invalid email or password',
            });
        }

        if (!user.emailVerified) {
            throw new ForbiddenException({
                error: 'EMAIL_NOT_VERIFIED',
                message: 'Please verify your email before logging in',
            });
        }

        if (user.isSuspended) {
            throw new ForbiddenException({
                error: 'FORBIDDEN',
                message: 'Your account has been suspended',
            });
        }

        const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
        if (!isPasswordValid) {
            throw new UnauthorizedException({
                error: 'INVALID_CREDENTIALS',
                message: 'Invalid email or password',
            });
        }

        // Generate tokens
        const accessToken = this.generateAccessToken(user);
        const { refreshToken, refreshTokenHash } = this.generateRefreshToken();

        // Store refresh token
        await this.prisma.refreshToken.create({
            data: {
                userId: user.id,
                tokenHash: refreshTokenHash,
                expiresAt: new Date(
                    Date.now() +
                    (this.configService.get<number>('JWT_REFRESH_EXPIRATION_DAYS') || 7) *
                    24 * 60 * 60 * 1000,
                ),
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

    // ─── Refresh Token ────────────────────────────────────

    async refreshTokens(oldRefreshToken: string, userAgent?: string, ipAddress?: string) {
        const tokenHash = this.hashToken(oldRefreshToken);

        const storedToken = await this.prisma.refreshToken.findFirst({
            where: { tokenHash },
            include: { user: true },
        });

        if (!storedToken) {
            throw new UnauthorizedException({
                error: 'TOKEN_INVALID',
                message: 'Invalid refresh token',
            });
        }

        // Reuse detection: if token is already revoked, someone stole it!
        if (storedToken.isRevoked) {
            this.logger.warn(
                `[SECURITY] Refresh token reuse detected for user ${storedToken.userId}. Revoking all tokens.`,
            );
            // Revoke ALL tokens for security
            await this.prisma.refreshToken.updateMany({
                where: { userId: storedToken.userId },
                data: { isRevoked: true },
            });
            throw new UnauthorizedException({
                error: 'REFRESH_TOKEN_REUSE',
                message: 'Security breach detected. All sessions have been revoked.',
            });
        }

        if (storedToken.expiresAt < new Date()) {
            throw new UnauthorizedException({
                error: 'TOKEN_EXPIRED',
                message: 'Refresh token has expired',
            });
        }

        // Rotate: revoke old, create new
        const accessToken = this.generateAccessToken(storedToken.user);
        const { refreshToken, refreshTokenHash } = this.generateRefreshToken();

        await this.prisma.$transaction([
            // Revoke old token
            this.prisma.refreshToken.update({
                where: { id: storedToken.id },
                data: { isRevoked: true },
            }),
            // Create new token
            this.prisma.refreshToken.create({
                data: {
                    userId: storedToken.userId,
                    tokenHash: refreshTokenHash,
                    expiresAt: new Date(
                        Date.now() +
                        (this.configService.get<number>('JWT_REFRESH_EXPIRATION_DAYS') || 7) *
                        24 * 60 * 60 * 1000,
                    ),
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

    // ─── Logout ───────────────────────────────────────────

    async logout(refreshToken: string) {
        const tokenHash = this.hashToken(refreshToken);

        await this.prisma.refreshToken.updateMany({
            where: { tokenHash },
            data: { isRevoked: true },
        });

        return { message: 'Logged out successfully' };
    }

    // ─── Forgot Password ─────────────────────────────────

    async forgotPassword(email: string) {
        const user = await this.prisma.user.findUnique({
            where: { email: email.toLowerCase() },
        });

        // Always return same response — prevent email enumeration
        const responseMessage = 'If this email is registered, you will receive a password reset link.';

        if (!user) {
            return { message: responseMessage };
        }

        // Rate limit: max 3 per hour
        const recentTokens = await this.prisma.passwordResetToken.count({
            where: {
                userId: user.id,
                createdAt: { gte: new Date(Date.now() - 60 * 60 * 1000) },
            },
        });

        if (recentTokens >= 3) {
            throw new HttpException(
                {
                    error: 'RATE_LIMIT_EXCEEDED',
                    message: 'Too many password reset requests. Please try again later.',
                },
                HttpStatus.TOO_MANY_REQUESTS,
            );
        }

        // Generate reset token (32 bytes random)
        const rawToken = crypto.randomBytes(32).toString('hex');
        const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');

        await this.prisma.passwordResetToken.create({
            data: {
                userId: user.id,
                tokenHash,
                expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
            },
        });

        // TODO: Send email via AWS SES
        this.logger.log(
            `[EMAIL STUB] Password reset for ${email}: /reset-password?token=${rawToken}`,
        );

        return { message: responseMessage };
    }

    // ─── Validate Reset Token ─────────────────────────────

    async validateResetToken(token: string) {
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

    // ─── Reset Password ──────────────────────────────────

    async resetPassword(token: string, newPassword: string) {
        const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

        const record = await this.prisma.passwordResetToken.findFirst({
            where: { tokenHash, usedAt: null },
            include: { user: true },
        });

        if (!record) {
            throw new UnauthorizedException({
                error: 'TOKEN_INVALID',
                message: 'Invalid reset token',
            });
        }

        if (record.expiresAt < new Date()) {
            throw new GoneException({
                error: 'RESET_TOKEN_EXPIRED',
                message: 'Password reset token has expired',
            });
        }

        // Check password !== email
        if (newPassword.toLowerCase() === record.user.email.toLowerCase()) {
            throw new HttpException(
                {
                    error: 'VALIDATION_ERROR',
                    message: 'Password cannot be the same as email',
                },
                HttpStatus.BAD_REQUEST,
            );
        }

        const passwordHash = await bcrypt.hash(newPassword, 12);

        await this.prisma.$transaction([
            // Update password
            this.prisma.user.update({
                where: { id: record.userId },
                data: { passwordHash },
            }),
            // Mark token as used
            this.prisma.passwordResetToken.update({
                where: { id: record.id },
                data: { usedAt: new Date() },
            }),
            // Revoke all refresh tokens → force logout all devices
            this.prisma.refreshToken.updateMany({
                where: { userId: record.userId },
                data: { isRevoked: true },
            }),
        ]);

        return { message: 'Password reset successfully. Please log in with your new password.' };
    }

    // ─── Helpers ──────────────────────────────────────────

    private generateAccessToken(user: { id: string; email: string; role: string }) {
        const payload = { sub: user.id, email: user.email, role: user.role };
        const secret = this.configService.get<string>('JWT_SECRET')!;
        const expiresIn = this.configService.get<string>('JWT_ACCESS_EXPIRATION') || '15m';
        return this.jwtService.sign(payload, {
            secret,
            expiresIn: expiresIn as any,
        });
    }

    private generateRefreshToken() {
        const refreshToken = uuidv4();
        const refreshTokenHash = this.hashToken(refreshToken);
        return { refreshToken, refreshTokenHash };
    }

    private hashToken(token: string): string {
        return crypto.createHash('sha256').update(token).digest('hex');
    }

    // ─── Find user by ID (for JWT strategy) ───────────────

    async findUserById(id: string) {
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
}
