"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var LocalStorageService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.LocalStorageService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const fs = __importStar(require("fs/promises"));
const path = __importStar(require("path"));
const crypto = __importStar(require("crypto"));
let LocalStorageService = LocalStorageService_1 = class LocalStorageService {
    configService;
    logger = new common_1.Logger(LocalStorageService_1.name);
    uploadDir;
    baseUrl;
    constructor(configService) {
        this.configService = configService;
        this.uploadDir = path.resolve(process.cwd(), 'uploads');
        const port = this.configService.get('PORT') || '3000';
        this.baseUrl = this.configService.get('BACKEND_URL') || `http://localhost:${port}`;
        this.ensureDirectoryExists(this.uploadDir).catch((err) => {
            this.logger.error(`Failed to create upload directory at ${this.uploadDir}`, err);
        });
    }
    async ensureDirectoryExists(dir) {
        try {
            await fs.access(dir);
        }
        catch {
            await fs.mkdir(dir, { recursive: true });
        }
    }
    async saveFile(file, folder) {
        try {
            const targetDir = folder ? path.join(this.uploadDir, folder) : this.uploadDir;
            await this.ensureDirectoryExists(targetDir);
            const ext = path.extname(file.originalname);
            const uuid = crypto.randomUUID();
            const uniqueFilename = `${uuid}${ext}`;
            const fullPath = path.join(targetDir, uniqueFilename);
            await fs.writeFile(fullPath, file.buffer);
            this.logger.log(`File saved locally: ${fullPath}`);
            const relativePath = folder ? path.join(folder, uniqueFilename) : uniqueFilename;
            const urlPath = relativePath.split(path.sep).join('/');
            const publicUrl = `${this.baseUrl}/uploads/${urlPath}`;
            return {
                url: publicUrl,
                path: relativePath,
                filename: file.originalname,
                size: file.size,
                mimeType: file.mimetype,
            };
        }
        catch (error) {
            this.logger.error(`Failed to save file locally`, error.stack);
            throw new common_1.InternalServerErrorException('Failed to save file');
        }
    }
    async deleteFile(relativePath) {
        try {
            const fullPath = path.join(this.uploadDir, relativePath);
            await fs.unlink(fullPath);
            this.logger.log(`File deleted locally: ${fullPath}`);
        }
        catch (error) {
            if (error.code !== 'ENOENT') {
                this.logger.error(`Failed to delete file locally: ${relativePath}`, error.stack);
                throw new common_1.InternalServerErrorException('Failed to delete file');
            }
        }
    }
    async getSignedUrl(relativePath, expiresIn) {
        const urlPath = relativePath.split(path.sep).join('/');
        return `${this.baseUrl}/uploads/${urlPath}`;
    }
};
exports.LocalStorageService = LocalStorageService;
exports.LocalStorageService = LocalStorageService = LocalStorageService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], LocalStorageService);
//# sourceMappingURL=local-storage.service.js.map