import { IsString, IsNotEmpty, MinLength, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ResetPasswordDto {
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    token: string;

    @ApiProperty({ example: 'NewP@ssw0rd' })
    @IsString()
    @MinLength(8, { message: 'Password must be at least 8 characters' })
    @Matches(/[A-Z]/, {
        message: 'Password must contain at least 1 uppercase letter',
    })
    @Matches(/[0-9]/, {
        message: 'Password must contain at least 1 number',
    })
    @Matches(/[!@#$%^&*]/, {
        message: 'Password must contain at least 1 special character (!@#$%^&*)',
    })
    newPassword: string;
}
