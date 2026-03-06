import {
    ExceptionFilter,
    Catch,
    ArgumentsHost,
    HttpException,
    HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';

export interface ErrorResponse {
    error: string;
    message: string;
    statusCode: number;
    timestamp: string;
    path: string;
    details?: Record<string, any>;
}

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
    catch(exception: unknown, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest<Request>();

        let status = HttpStatus.INTERNAL_SERVER_ERROR;
        let errorCode = 'INTERNAL_SERVER_ERROR';
        let message = 'An unexpected error occurred';
        let details: Record<string, any> | undefined;

        if (exception instanceof HttpException) {
            status = exception.getStatus();
            const exceptionResponse = exception.getResponse();

            if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
                const resp = exceptionResponse as Record<string, any>;
                errorCode = resp.error || this.getErrorCode(status);
                message = resp.message || exception.message;
                details = resp.details;

                // Handle class-validator errors
                if (Array.isArray(resp.message)) {
                    errorCode = 'VALIDATION_ERROR';
                    message = 'Validation failed';
                    details = {
                        fields: resp.message.map((msg: string) => ({
                            message: msg,
                        })),
                    };
                }
            } else {
                message = exceptionResponse as string;
                errorCode = this.getErrorCode(status);
            }
        }

        const errorResponse: ErrorResponse = {
            error: errorCode,
            message,
            statusCode: status,
            timestamp: new Date().toISOString(),
            path: request.url,
            ...(details && { details }),
        };

        response.status(status).json(errorResponse);
    }

    private getErrorCode(status: number): string {
        const codeMap: Record<number, string> = {
            400: 'VALIDATION_ERROR',
            401: 'INVALID_CREDENTIALS',
            403: 'FORBIDDEN',
            404: 'RESOURCE_NOT_FOUND',
            409: 'CONFLICT',
            410: 'GONE',
            413: 'FILE_TOO_LARGE',
            415: 'FILE_TYPE_NOT_ALLOWED',
            422: 'UNPROCESSABLE_ENTITY',
            429: 'RATE_LIMIT_EXCEEDED',
            500: 'INTERNAL_SERVER_ERROR',
        };
        return codeMap[status] || 'INTERNAL_SERVER_ERROR';
    }
}
