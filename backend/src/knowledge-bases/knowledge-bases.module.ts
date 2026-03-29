import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { KnowledgeBasesService } from './knowledge-bases.service.js';
import { KnowledgeBasesController } from './knowledge-bases.controller.js';
import { KnowledgeBase } from './entities/knowledge-base.entity.js';
import { CompaniesModule } from '../companies/companies.module.js';

@Module({
  imports: [TypeOrmModule.forFeature([KnowledgeBase]), CompaniesModule],
  controllers: [KnowledgeBasesController],
  providers: [KnowledgeBasesService],
  exports: [KnowledgeBasesService],
})
export class KnowledgeBasesModule {}
