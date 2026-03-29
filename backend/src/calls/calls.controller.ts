import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Query,
  ParseUUIDPipe,
  UseGuards,
  DefaultValuePipe,
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { CallsService } from './calls.service.js';
import { CreateCallDto } from './dto/call.dto.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';
import { User } from '../users/entities/user.entity.js';

@ApiTags('calls')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('calls')
export class CallsController {
  constructor(private readonly callsService: CallsService) {}

  @Get()
  @ApiOperation({ summary: 'List calls for the current user (paginated)' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  findAll(
    @CurrentUser() user: User,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
  ) {
    return this.callsService.findAll(user.id, page, limit);
  }

  @Get('recent')
  @ApiOperation({ summary: 'Get recent calls (shortcut for page 1)' })
  findRecent(@CurrentUser() user: User) {
    return this.callsService.findRecent(user.id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a call record' })
  create(@CurrentUser() user: User, @Body() dto: CreateCallDto) {
    return this.callsService.create(user.id, dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single call by ID' })
  findOne(@CurrentUser() user: User, @Param('id', ParseUUIDPipe) id: string) {
    return this.callsService.findOne(user.id, id);
  }
}
