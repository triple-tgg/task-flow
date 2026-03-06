import {
    Controller,
    Post,
    Body,
    Get,
    Query,
    Req,
    Res,
    HttpCode,
    HttpStatus,
    UnauthorizedException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse as SwaggerResponse } from '@nestjs/swagger';
import * as express from 'express';
import { AuthService } from './auth.service';
import { RegisterDto, LoginDto, ForgotPasswordDto, ResetPasswordDto } from './dto';
import { Public } from './decorators';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @Public()
    @Post('register')
    @ApiOperation({ summary: 'Register a new user' })
    @SwaggerResponse({ status: 201, description: 'Verification email sent' })
    @SwaggerResponse({ status: 409, description: 'Email already exists' })
    async register(@Body() dto: RegisterDto) {
        return this.authService.register(dto.name, dto.email, dto.password);
    }

    @Public()
    @Post('verify-email')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Verify email with token' })
    async verifyEmail(@Body('token') token: string) {
        return this.authService.verifyEmail(token);
    }

    @Public()
    @Post('resend-verification')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Resend verification email' })
    async resendVerification(@Body('email') email: string) {
        return this.authService.resendVerification(email);
    }

    @Public()
    @Post('login')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Login with email and password' })
    @SwaggerResponse({ status: 200, description: 'Login successful' })
    @SwaggerResponse({ status: 401, description: 'Invalid credentials' })
    @SwaggerResponse({ status: 403, description: 'Email not verified' })
    async login(
        @Body() dto: LoginDto,
        @Req() req: express.Request,
        @Res({ passthrough: true }) res: express.Response,
    ) {
        const userAgent = req.headers['user-agent'];
        const ipAddress = req.ip;
        const result = await this.authService.login(
            dto.email,
            dto.password,
            userAgent,
            ipAddress,
        );

        // Set refresh token as httpOnly cookie
        res.cookie('refreshToken', result.refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
            path: '/',
        });

        return {
            accessToken: result.accessToken,
            user: result.user,
        };
    }

    @Public()
    @Post('refresh')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Refresh access token' })
    async refresh(
        @Req() req: express.Request,
        @Res({ passthrough: true }) res: express.Response,
    ) {
        const refreshToken = (req as any).cookies?.refreshToken;
        if (!refreshToken) {
            throw new UnauthorizedException({
                error: 'TOKEN_INVALID',
                message: 'No refresh token provided',
            });
        }

        const userAgent = req.headers['user-agent'];
        const ipAddress = req.ip;
        const result = await this.authService.refreshTokens(
            refreshToken,
            userAgent,
            ipAddress,
        );

        // Set new refresh token cookie
        res.cookie('refreshToken', result.refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000,
            path: '/',
        });

        return {
            accessToken: result.accessToken,
            user: result.user,
        };
    }

    @Post('logout')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Logout and revoke refresh token' })
    async logout(
        @Req() req: express.Request,
        @Res({ passthrough: true }) res: express.Response,
    ) {
        const refreshToken = (req as any).cookies?.refreshToken;
        if (refreshToken) {
            await this.authService.logout(refreshToken);
        }

        // Clear cookie
        res.clearCookie('refreshToken', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            path: '/',
        });

        return { message: 'Logged out successfully' };
    }

    @Public()
    @Post('forgot-password')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Request password reset email' })
    async forgotPassword(@Body() dto: ForgotPasswordDto) {
        return this.authService.forgotPassword(dto.email);
    }

    @Public()
    @Get('reset-password/validate')
    @ApiOperation({ summary: 'Validate password reset token' })
    async validateResetToken(@Query('token') token: string) {
        return this.authService.validateResetToken(token);
    }

    @Public()
    @Post('reset-password')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Reset password with token' })
    async resetPassword(@Body() dto: ResetPasswordDto) {
        return this.authService.resetPassword(dto.token, dto.newPassword);
    }
}
