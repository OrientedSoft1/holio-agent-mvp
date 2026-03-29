import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  Param,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PlaygroundService } from './playground.service.js';
import {
  InvokePlaygroundDto,
  CreatePresetDto,
} from './dto/invoke-playground.dto.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';
import { User } from '../users/entities/user.entity.js';

@ApiTags('playground')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('companies/:companyId/playground')
export class PlaygroundController {
  constructor(private readonly playgroundService: PlaygroundService) {}

  @Post('invoke')
  @ApiOperation({ summary: 'Invoke a model in the playground' })
  invoke(
    @Param('companyId', ParseUUIDPipe) companyId: string,
    @Body() dto: InvokePlaygroundDto,
  ) {
    return this.playgroundService.invoke(companyId, dto);
  }

  @Get('presets')
  @ApiOperation({ summary: 'List playground presets' })
  getPresets(
    @Param('companyId', ParseUUIDPipe) companyId: string,
    @CurrentUser() user: User,
  ) {
    return this.playgroundService.getPresets(companyId, user.id);
  }

  @Post('presets')
  @ApiOperation({ summary: 'Create a playground preset' })
  createPreset(
    @Param('companyId', ParseUUIDPipe) companyId: string,
    @CurrentUser() user: User,
    @Body() dto: CreatePresetDto,
  ) {
    return this.playgroundService.createPreset(companyId, user.id, dto);
  }

  @Delete('presets/:presetId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a playground preset' })
  deletePreset(
    @Param('companyId', ParseUUIDPipe) companyId: string,
    @Param('presetId', ParseUUIDPipe) presetId: string,
    @CurrentUser() user: User,
  ) {
    return this.playgroundService.deletePreset(companyId, user.id, presetId);
  }
}
