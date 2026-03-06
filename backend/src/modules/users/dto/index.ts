import {
    IsOptional,
    IsString,
    MinLength,
    Matches,
} from 'class-validator';

export class UpdateProfileDto {
    @IsOptional()
    @IsString()
    @MinLength(1)
    name?: string;
}

export class ChangePasswordDto {
    @IsString()
    currentPassword: string;

    @IsString()
    @MinLength(8)
    @Matches(/[A-Z]/, { message: 'New password must contain at least 1 uppercase letter' })
    @Matches(/[0-9]/, { message: 'New password must contain at least 1 number' })
    @Matches(/[!@#$%^&*]/, { message: 'New password must contain at least 1 special character' })
    newPassword: string;
}
