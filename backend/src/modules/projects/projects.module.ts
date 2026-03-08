import { Module } from '@nestjs/common';
import { ProjectsController } from './projects.controller';
import { ProjectsService } from './projects.service';
import { AccessGroupsController } from './controllers/access-groups.controller';
import { AccessGroupsService } from './services/access-groups.service';

@Module({
    controllers: [ProjectsController, AccessGroupsController],
    providers: [ProjectsService, AccessGroupsService],
    exports: [ProjectsService, AccessGroupsService],
})
export class ProjectsModule { }
