import { IsString, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateToolDto {
    @ApiProperty() @IsString() name: string;
    @ApiPropertyOptional() @IsOptional() @IsString() category?: string;
    @ApiPropertyOptional() @IsOptional() @IsString() website?: string;
    @ApiPropertyOptional() @IsOptional() @IsString() iconUrl?: string;
    @ApiPropertyOptional() @IsOptional() @IsString() description?: string;
}

export class UpdateToolDto {
    @ApiPropertyOptional() @IsOptional() @IsString() name?: string;
    @ApiPropertyOptional() @IsOptional() @IsString() category?: string;
    @ApiPropertyOptional() @IsOptional() @IsString() website?: string;
    @ApiPropertyOptional() @IsOptional() @IsString() iconUrl?: string;
    @ApiPropertyOptional() @IsOptional() @IsString() description?: string;
}

export class CreateAccountDto {
    @ApiProperty() @IsString() name: string;
    @ApiPropertyOptional() @IsOptional() @IsString() projectId?: string;
    @ApiPropertyOptional() @IsOptional() @IsString() username?: string;
    @ApiPropertyOptional() @IsOptional() @IsString() email?: string;
    @ApiPropertyOptional() @IsOptional() @IsString() note?: string;
}

export class UpdateAccountDto {
    @ApiPropertyOptional() @IsOptional() @IsString() name?: string;
    @ApiPropertyOptional() @IsOptional() @IsString() projectId?: string;
    @ApiPropertyOptional() @IsOptional() @IsString() username?: string;
    @ApiPropertyOptional() @IsOptional() @IsString() email?: string;
    @ApiPropertyOptional() @IsOptional() @IsString() note?: string;
}

export class CreateSecretDto {
    @ApiProperty({ description: 'Secret key, e.g. PASSWORD, API_KEY, TOKEN' })
    @IsString() key: string;

    @ApiProperty({ description: 'Plain-text value (will be encrypted)' })
    @IsString() value: string;
}

export class UpdateSecretDto {
    @ApiProperty({ description: 'New plain-text value (will be encrypted)' })
    @IsString() value: string;
}
