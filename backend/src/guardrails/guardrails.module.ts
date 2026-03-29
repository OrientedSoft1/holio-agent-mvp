import { Module } from '@nestjs/common';
import { GuardrailsController } from './guardrails.controller.js';
import { GuardrailsService } from './guardrails.service.js';
import { CompaniesModule } from '../companies/companies.module.js';

@Module({
  imports: [CompaniesModule],
  controllers: [GuardrailsController],
  providers: [GuardrailsService],
})
export class GuardrailsModule {}
