import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { GuardrailsService } from './guardrails.service.js';
import { CreateGuardrailDto, TestGuardrailDto } from './dto/guardrail.dto.js';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';

@ApiTags('guardrails')
@UseGuards(JwtAuthGuard)
@Controller('companies/:companyId/guardrails')
export class GuardrailsController {
  constructor(private readonly guardrailsService: GuardrailsService) {}

  @Get()
  @ApiOperation({ summary: 'List guardrails' })
  list(@Param('companyId', ParseUUIDPipe) companyId: string) {
    return this.guardrailsService.listGuardrails(companyId);
  }

  @Get(':guardrailId')
  @ApiOperation({ summary: 'Get guardrail details' })
  getOne(
    @Param('companyId', ParseUUIDPipe) companyId: string,
    @Param('guardrailId') guardrailId: string,
  ) {
    return this.guardrailsService.getGuardrail(companyId, guardrailId);
  }

  @Post()
  @ApiOperation({ summary: 'Create a guardrail' })
  create(
    @Param('companyId', ParseUUIDPipe) companyId: string,
    @Body() dto: CreateGuardrailDto,
  ) {
    return this.guardrailsService.createGuardrail(companyId, dto);
  }

  @Delete(':guardrailId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a guardrail' })
  remove(
    @Param('companyId', ParseUUIDPipe) companyId: string,
    @Param('guardrailId') guardrailId: string,
  ) {
    return this.guardrailsService.deleteGuardrail(companyId, guardrailId);
  }

  @Post(':guardrailId/test')
  @ApiOperation({ summary: 'Test content against a guardrail' })
  test(
    @Param('companyId', ParseUUIDPipe) companyId: string,
    @Param('guardrailId') guardrailId: string,
    @Body() dto: TestGuardrailDto,
  ) {
    return this.guardrailsService.testGuardrail(
      companyId,
      guardrailId,
      dto.content,
      dto.source,
    );
  }
}
