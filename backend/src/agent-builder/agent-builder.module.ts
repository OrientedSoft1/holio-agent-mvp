import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AgentBuilderController } from './agent-builder.controller.js';
import { AgentBuilderService } from './agent-builder.service.js';
import { AgentDefinition } from './entities/agent-definition.entity.js';
import { CompaniesModule } from '../companies/companies.module.js';

@Module({
  imports: [TypeOrmModule.forFeature([AgentDefinition]), CompaniesModule],
  controllers: [AgentBuilderController],
  providers: [AgentBuilderService],
})
export class AgentBuilderModule {}
