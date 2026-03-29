import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  ParseUUIDPipe,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { IntegrationsService } from './integrations.service.js';
import {
  CreateIntegrationDto,
  UpdateIntegrationDto,
} from './dto/integration.dto.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';
import { User } from '../users/entities/user.entity.js';

@ApiTags('integrations')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('companies/:companyId/integrations')
export class IntegrationsController {
  constructor(private readonly integrationsService: IntegrationsService) {}

  @Get()
  @ApiOperation({ summary: 'List all integrations for a company' })
  findAll(
    @CurrentUser() _user: User,
    @Param('companyId', ParseUUIDPipe) companyId: string,
  ) {
    return this.integrationsService.findAll(companyId);
  }

  @Post()
  @ApiOperation({ summary: 'Create an integration' })
  create(
    @CurrentUser() _user: User,
    @Param('companyId', ParseUUIDPipe) companyId: string,
    @Body() dto: CreateIntegrationDto,
  ) {
    return this.integrationsService.create(companyId, dto);
  }

  @Patch(':id/toggle')
  @ApiOperation({ summary: 'Toggle integration connection status' })
  toggle(
    @CurrentUser() _user: User,
    @Param('companyId', ParseUUIDPipe) companyId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.integrationsService.toggle(companyId, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an integration' })
  update(
    @CurrentUser() _user: User,
    @Param('companyId', ParseUUIDPipe) companyId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateIntegrationDto,
  ) {
    return this.integrationsService.update(companyId, id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete an integration' })
  remove(
    @CurrentUser() _user: User,
    @Param('companyId', ParseUUIDPipe) companyId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.integrationsService.remove(companyId, id);
  }
}
