import {
    Injectable,
    NotFoundException,
    UnauthorizedException,
    ForbiddenException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class UsersService {
    constructor(private prisma: PrismaService) { }

    async findById(id: string) {
        const user = await this.prisma.user.findUnique({
            where: { id },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                emailVerified: true,
                createdAt: true,
                updatedAt: true,
            },
        });
        if (!user) {
            throw new NotFoundException({
                error: 'USER_NOT_FOUND',
                message: 'User not found',
            });
        }
        return user;
    }

    async updateProfile(userId: string, data: { name?: string }) {
        return this.prisma.user.update({
            where: { id: userId },
            data,
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
            },
        });
    }

    async changePassword(userId: string, currentPassword: string, newPassword: string) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
        });
        if (!user) {
            throw new NotFoundException({ error: 'USER_NOT_FOUND', message: 'User not found' });
        }

        if (!user.passwordHash) {
            throw new ForbiddenException({
                error: 'OAUTH_ONLY',
                message: 'Cannot change password for Google sign-in accounts. Use forgot password to set one.',
            });
        }

        const isValid = await bcrypt.compare(currentPassword, user.passwordHash);
        if (!isValid) {
            throw new UnauthorizedException({
                error: 'INVALID_CREDENTIALS',
                message: 'Current password is incorrect',
            });
        }

        if (newPassword.toLowerCase() === user.email.toLowerCase()) {
            throw new ForbiddenException({
                error: 'VALIDATION_ERROR',
                message: 'Password cannot be the same as email',
            });
        }

        const passwordHash = await bcrypt.hash(newPassword, 12);
        await this.prisma.user.update({
            where: { id: userId },
            data: { passwordHash },
        });

        return { message: 'Password changed successfully' };
    }

    // Admin: list users with pagination
    async findAll(page = 1, limit = 20) {
        const skip = (page - 1) * limit;
        const [users, total] = await Promise.all([
            this.prisma.user.findMany({
                skip,
                take: limit,
                where: { deletedAt: null },
                select: {
                    id: true,
                    name: true,
                    email: true,
                    role: true,
                    emailVerified: true,
                    isSuspended: true,
                    createdAt: true,
                },
                orderBy: { createdAt: 'desc' },
            }),
            this.prisma.user.count({ where: { deletedAt: null } }),
        ]);

        return {
            data: users,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    // Admin: suspend/unsuspend user
    async toggleSuspension(userId: string, isSuspended: boolean) {
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user) {
            throw new NotFoundException({ error: 'USER_NOT_FOUND', message: 'User not found' });
        }

        await this.prisma.user.update({
            where: { id: userId },
            data: { isSuspended },
        });

        // Revoke all refresh tokens if suspending
        if (isSuspended) {
            await this.prisma.refreshToken.updateMany({
                where: { userId, isRevoked: false },
                data: { isRevoked: true },
            });
        }

        return { message: isSuspended ? 'User suspended' : 'User unsuspended' };
    }
}
