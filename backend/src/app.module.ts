import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { PrismaModule } from './prisma';
import { AuthModule, JwtAuthGuard, RolesGuard } from './modules/auth';
import { UsersModule } from './modules/users';
import { ProjectsModule } from './modules/projects';
import { TasksModule } from './modules/tasks';
import { CommentsModule } from './modules/comments';
import { NotificationsModule } from './modules/notifications';
import { SearchModule } from './modules/search';
import { ActivityLogModule } from './modules/activity-log';
import { AnalyticsModule } from './modules/analytics';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { StorageModule } from './modules/storage/storage.module';
import { AttachmentsModule } from './modules/attachments/attachments.module';
import { VaultModule } from './modules/vault/vault.module';
import { HealthModule } from './modules/health/health.module';

@Module({
  imports: [
    // Global config from .env
    ConfigModule.forRoot({ isGlobal: true }),

    // Rate limiting
    ThrottlerModule.forRoot([
      {
        ttl: 60000, // 1 minute
        limit: 100, // 100 requests per minute
      },
    ]),

    // Database
    PrismaModule,

    // Feature modules
    AuthModule,
    UsersModule,
    ProjectsModule,
    TasksModule,
    CommentsModule,
    NotificationsModule,
    SearchModule,
    ActivityLogModule,
    AnalyticsModule,

    // File storage support
    StorageModule,
    AttachmentsModule,

    // Vault / Credential Manager (TDD Section 14)
    VaultModule,

    // Health check (public, no auth)
    HealthModule,

    // Serve uploaded files statically at /uploads
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'uploads'),
      serveRoot: '/uploads',
    }),
  ],
  providers: [
    // Global error format (TDD Section 6)
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
    // Global JWT auth guard
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    // Global roles guard
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
    // Global rate limiter
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule { }
