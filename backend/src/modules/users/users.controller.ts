import {
    Controller,
    Get,
    Put,
    Post,
    Body,
    Param,
    Query,
    HttpCode,
    HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { UpdateProfileDto, ChangePasswordDto } from './dto';
import { CurrentUser, Roles } from '../auth/decorators';

@ApiTags('users')
@ApiBearerAuth()
@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    // ─── Profile endpoints ───────────────────────────────

    @Get('me')
    @ApiOperation({ summary: 'Get current user profile' })
    async getProfile(@CurrentUser('id') userId: string) {
        return this.usersService.findById(userId);
    }

    @Put('me')
    @ApiOperation({ summary: 'Update current user profile' })
    async updateProfile(
        @CurrentUser('id') userId: string,
        @Body() dto: UpdateProfileDto,
    ) {
        return this.usersService.updateProfile(userId, dto);
    }

    @Post('me/change-password')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Change password' })
    async changePassword(
        @CurrentUser('id') userId: string,
        @Body() dto: ChangePasswordDto,
    ) {
        return this.usersService.changePassword(userId, dto.currentPassword, dto.newPassword);
    }

    // ─── Admin endpoints ─────────────────────────────────

    @Get()
    @Roles('admin')
    @ApiOperation({ summary: 'List all users (admin)' })
    async findAll(
        @Query('page') page?: string,
        @Query('limit') limit?: string,
    ) {
        return this.usersService.findAll(
            page ? parseInt(page, 10) : 1,
            limit ? parseInt(limit, 10) : 20,
        );
    }

    @Get(':id')
    @Roles('admin')
    @ApiOperation({ summary: 'Get user by ID (admin)' })
    async findOne(@Param('id') id: string) {
        return this.usersService.findById(id);
    }

    @Post(':id/suspend')
    @Roles('admin')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Suspend user (admin)' })
    async suspend(@Param('id') id: string) {
        return this.usersService.toggleSuspension(id, true);
    }

    @Post(':id/unsuspend')
    @Roles('admin')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Unsuspend user (admin)' })
    async unsuspend(@Param('id') id: string) {
        return this.usersService.toggleSuspension(id, false);
    }
}
