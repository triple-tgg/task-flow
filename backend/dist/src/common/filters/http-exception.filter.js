"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HttpExceptionFilter = void 0;
const common_1 = require("@nestjs/common");
let HttpExceptionFilter = class HttpExceptionFilter {
    catch(exception, host) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse();
        const request = ctx.getRequest();
        let status = common_1.HttpStatus.INTERNAL_SERVER_ERROR;
        let errorCode = 'INTERNAL_SERVER_ERROR';
        let message = 'An unexpected error occurred';
        let details;
        if (exception instanceof common_1.HttpException) {
            status = exception.getStatus();
            const exceptionResponse = exception.getResponse();
            if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
                const resp = exceptionResponse;
                errorCode = resp.error || this.getErrorCode(status);
                message = resp.message || exception.message;
                details = resp.details;
                if (Array.isArray(resp.message)) {
                    errorCode = 'VALIDATION_ERROR';
                    message = 'Validation failed';
                    details = {
                        fields: resp.message.map((msg) => ({
                            message: msg,
                        })),
                    };
                }
            }
            else {
                message = exceptionResponse;
                errorCode = this.getErrorCode(status);
            }
        }
        const errorResponse = {
            error: errorCode,
            message,
            statusCode: status,
            timestamp: new Date().toISOString(),
            path: request.url,
            ...(details && { details }),
        };
        response.status(status).json(errorResponse);
    }
    getErrorCode(status) {
        const codeMap = {
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
};
exports.HttpExceptionFilter = HttpExceptionFilter;
exports.HttpExceptionFilter = HttpExceptionFilter = __decorate([
    (0, common_1.Catch)()
], HttpExceptionFilter);
//# sourceMappingURL=http-exception.filter.js.map