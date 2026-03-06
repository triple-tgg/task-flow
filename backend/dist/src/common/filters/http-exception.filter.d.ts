import { ExceptionFilter, ArgumentsHost } from '@nestjs/common';
export interface ErrorResponse {
    error: string;
    message: string;
    statusCode: number;
    timestamp: string;
    path: string;
    details?: Record<string, any>;
}
export declare class HttpExceptionFilter implements ExceptionFilter {
    catch(exception: unknown, host: ArgumentsHost): void;
    private getErrorCode;
}
