import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CompaniesService } from './companies.service.js';
import { CompaniesController } from './companies.controller.js';
import { BedrockConfigService } from './bedrock-config.service.js';
import { OpenAIConfigService } from './openai-config.service.js';
import { GeminiConfigService } from './gemini-config.service.js';
import { Company } from './entities/company.entity.js';
import { CompanyMember } from './entities/company-member.entity.js';
import { CompanyInvitation } from './entities/company-invitation.entity.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([Company, CompanyMember, CompanyInvitation]),
  ],
  controllers: [CompaniesController],
  providers: [CompaniesService, BedrockConfigService, OpenAIConfigService, GeminiConfigService],
  exports: [CompaniesService, BedrockConfigService, OpenAIConfigService, GeminiConfigService, TypeOrmModule],
})
export class CompaniesModule {}
