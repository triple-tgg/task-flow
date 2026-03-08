export declare class CreateToolDto {
    name: string;
    category?: string;
    website?: string;
    iconUrl?: string;
    description?: string;
}
export declare class UpdateToolDto {
    name?: string;
    category?: string;
    website?: string;
    iconUrl?: string;
    description?: string;
}
export declare class CreateAccountDto {
    name: string;
    projectId?: string;
    username?: string;
    email?: string;
    note?: string;
}
export declare class UpdateAccountDto {
    name?: string;
    projectId?: string;
    username?: string;
    email?: string;
    note?: string;
}
export declare class CreateSecretDto {
    key: string;
    value: string;
}
export declare class UpdateSecretDto {
    value: string;
}
