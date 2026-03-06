import {
    IsString,
    IsOptional,
    MinLength,
    IsIn,
    IsUUID,
} from 'class-validator';

export class CreateProjectDto {
    @IsString()
    @MinLength(1)
    name: string;

    @IsOptional()
    @IsString()
    description?: string;
}

export class UpdateProjectDto {
    @IsOptional()
    @IsString()
    @MinLength(1)
    name?: string;

    @IsOptional()
    @IsString()
    description?: string;
}

export class AddMemberDto {
    @IsUUID()
    userId: string;

    @IsOptional()
    @IsIn(['editor', 'viewer'])
    role?: string = 'editor';
}

export class UpdateMemberRoleDto {
    @IsIn(['editor', 'viewer'])
    role: string;
}
