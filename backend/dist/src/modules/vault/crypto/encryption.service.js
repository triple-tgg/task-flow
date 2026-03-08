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
var EncryptionService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.EncryptionService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const crypto = __importStar(require("crypto"));
let EncryptionService = EncryptionService_1 = class EncryptionService {
    config;
    logger = new common_1.Logger(EncryptionService_1.name);
    keys = new Map();
    currentVersion;
    constructor(config) {
        this.config = config;
        this.currentVersion = parseInt(config.get('VAULT_CURRENT_VERSION') || '1', 10);
        for (let v = 1; v <= 10; v++) {
            const hex = config.get(`VAULT_KEY_V${v}`);
            if (hex) {
                this.keys.set(v, Buffer.from(hex, 'hex'));
            }
        }
        if (!this.keys.has(this.currentVersion)) {
            this.logger.warn(`VAULT_KEY_V${this.currentVersion} not found in environment. Vault encryption will fail.`);
        }
    }
    encrypt(plaintext) {
        const key = this.keys.get(this.currentVersion);
        if (!key)
            throw new Error(`Vault encryption key V${this.currentVersion} not configured`);
        const iv = crypto.randomBytes(16);
        const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
        let ciphertext = cipher.update(plaintext, 'utf8', 'hex');
        ciphertext += cipher.final('hex');
        const authTag = cipher.getAuthTag().toString('hex');
        const payload = {
            iv: iv.toString('hex'),
            authTag,
            ciphertext,
            keyVersion: this.currentVersion,
        };
        return JSON.stringify(payload);
    }
    decrypt(encryptedJson) {
        const payload = JSON.parse(encryptedJson);
        const key = this.keys.get(payload.keyVersion);
        if (!key)
            throw new Error(`Vault key V${payload.keyVersion} not available for decryption`);
        const decipher = crypto.createDecipheriv('aes-256-gcm', key, Buffer.from(payload.iv, 'hex'));
        decipher.setAuthTag(Buffer.from(payload.authTag, 'hex'));
        let plaintext = decipher.update(payload.ciphertext, 'hex', 'utf8');
        plaintext += decipher.final('utf8');
        return plaintext;
    }
    needsReEncrypt(keyVersion) {
        return keyVersion < this.currentVersion;
    }
    getCurrentVersion() {
        return this.currentVersion;
    }
};
exports.EncryptionService = EncryptionService;
exports.EncryptionService = EncryptionService = EncryptionService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], EncryptionService);
//# sourceMappingURL=encryption.service.js.map