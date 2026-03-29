import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  ParseUUIDPipe,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CompaniesService } from './companies.service.js';
import { BedrockConfigService } from './bedrock-config.service.js';
import { OpenAIConfigService } from './openai-config.service.js';
import { GeminiConfigService } from './gemini-config.service.js';
import { CreateCompanyDto } from './dto/create-company.dto.js';
import { UpdateCompanyDto } from './dto/update-company.dto.js';
import { InviteMemberDto } from './dto/invite-member.dto.js';
import { UpdateMemberDto } from './dto/update-member.dto.js';
import {
  UpdateBedrockConfigDto,
  ValidateBedrockCredentialsDto,
} from './dto/bedrock-config.dto.js';
import {
  UpdateOpenAIConfigDto,
  ValidateOpenAIKeyDto,
} from './dto/openai-config.dto.js';
import {
  UpdateGeminiConfigDto,
  ValidateGeminiKeyDto,
} from './dto/gemini-config.dto.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';
import { User } from '../users/entities/user.entity.js';

@ApiTags('companies')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('companies')
export class CompaniesController {
  constructor(
    private readonly companiesService: CompaniesService,
    private readonly bedrockConfigService: BedrockConfigService,
    private readonly openaiConfigService: OpenAIConfigService,
    private readonly geminiConfigService: GeminiConfigService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new company' })
  create(@CurrentUser() user: User, @Body() dto: CreateCompanyDto) {
    return this.companiesService.create(user.id, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List all companies for the current user' })
  findAll(@CurrentUser() user: User) {
    return this.companiesService.findAllForUser(user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a company by ID' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.companiesService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a company' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: User,
    @Body() dto: UpdateCompanyDto,
  ) {
    return this.companiesService.update(id, user.id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a company' })
  remove(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: User) {
    return this.companiesService.remove(id, user.id);
  }

  @Get(':id/members')
  @ApiOperation({ summary: 'List members of a company (paginated)' })
  getMembers(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.companiesService.getMembers(
      id,
      page ? parseInt(page, 10) : 1,
      limit ? parseInt(limit, 10) : 20,
    );
  }

  // ──── Invitations ────

  @Post(':id/invite')
  @ApiOperation({ summary: 'Invite a user to the company' })
  invite(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: User,
    @Body() dto: InviteMemberDto,
  ) {
    return this.companiesService.invite(id, user.id, dto);
  }

  @Get(':id/invitations')
  @ApiOperation({ summary: 'List pending invitations for a company' })
  getInvitations(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: User,
  ) {
    return this.companiesService.getInvitations(id, user.id);
  }

  @Post('invitations/:token/accept')
  @ApiOperation({ summary: 'Accept a company invitation' })
  acceptInvitation(@Param('token') token: string, @CurrentUser() user: User) {
    return this.companiesService.acceptInvitation(token, user.id);
  }

  @Post('invitations/:token/decline')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Decline a company invitation' })
  declineInvitation(@Param('token') token: string) {
    return this.companiesService.declineInvitation(token);
  }

  @Delete(':id/invitations/:invitationId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Cancel/delete a company invitation' })
  cancelInvitation(
    @Param('id', ParseUUIDPipe) companyId: string,
    @Param('invitationId', ParseUUIDPipe) invitationId: string,
    @CurrentUser() user: User,
  ) {
    return this.companiesService.cancelInvitation(
      companyId,
      invitationId,
      user.id,
    );
  }

  // ──── Member management ────

  @Patch(':id/members/:userId')
  @ApiOperation({ summary: "Update a member's role" })
  updateMemberRole(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('userId', ParseUUIDPipe) userId: string,
    @Body() dto: UpdateMemberDto,
    @CurrentUser() user: User,
  ) {
    return this.companiesService.updateMemberRole(
      id,
      userId,
      dto.role,
      user.id,
    );
  }

  @Delete(':id/members/:userId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove a member from the company' })
  removeMember(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('userId', ParseUUIDPipe) userId: string,
    @CurrentUser() user: User,
  ) {
    return this.companiesService.removeMember(id, userId, user.id);
  }

  // ──── Bedrock Configuration ────

  @Get(':id/bedrock-config')
  @ApiOperation({ summary: 'Get Bedrock configuration for a company' })
  async getBedrockConfig(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: User,
  ) {
    await this.companiesService.checkAdminAccessPublic(id, user.id);
    return this.bedrockConfigService.getConfig(id);
  }

  @Put(':id/bedrock-config')
  @ApiOperation({ summary: 'Update Bedrock configuration for a company' })
  async updateBedrockConfig(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: User,
    @Body() dto: UpdateBedrockConfigDto,
  ) {
    await this.companiesService.checkAdminAccessPublic(id, user.id);
    return this.bedrockConfigService.updateConfig(id, dto);
  }

  @Post(':id/bedrock-config/validate')
  @ApiOperation({ summary: 'Validate AWS Bedrock credentials' })
  async validateBedrockCredentials(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: User,
    @Body() dto: ValidateBedrockCredentialsDto,
  ) {
    await this.companiesService.checkAdminAccessPublic(id, user.id);
    return this.bedrockConfigService.validateCredentials(
      dto.accessKeyId,
      dto.secretAccessKey,
      dto.region,
    );
  }

  @Get(':id/bedrock-models')
  @ApiOperation({ summary: 'List available Bedrock models for a company' })
  async listBedrockModels(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: User,
  ) {
    await this.companiesService.checkAdminAccessPublic(id, user.id);
    return this.bedrockConfigService.listModels(id);
  }

  // ──── OpenAI Configuration ────

  @Get(':id/openai-config')
  @ApiOperation({ summary: 'Get OpenAI configuration for a company' })
  async getOpenAIConfig(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: User,
  ) {
    await this.companiesService.checkAdminAccessPublic(id, user.id);
    return this.openaiConfigService.getConfig(id);
  }

  @Put(':id/openai-config')
  @ApiOperation({ summary: 'Update OpenAI configuration for a company' })
  async updateOpenAIConfig(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: User,
    @Body() dto: UpdateOpenAIConfigDto,
  ) {
    await this.companiesService.checkAdminAccessPublic(id, user.id);
    return this.openaiConfigService.updateConfig(id, dto);
  }

  @Post(':id/openai-config/validate')
  @ApiOperation({ summary: 'Validate an OpenAI API key' })
  async validateOpenAIKey(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: User,
    @Body() dto: ValidateOpenAIKeyDto,
  ) {
    await this.companiesService.checkAdminAccessPublic(id, user.id);
    return this.openaiConfigService.validateApiKey(dto.apiKey);
  }

  // ──── Gemini Configuration ────

  @Get(':id/gemini-config')
  @ApiOperation({ summary: 'Get Gemini configuration for a company' })
  async getGeminiConfig(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: User,
  ) {
    await this.companiesService.checkAdminAccessPublic(id, user.id);
    return this.geminiConfigService.getConfig(id);
  }

  @Put(':id/gemini-config')
  @ApiOperation({ summary: 'Update Gemini configuration for a company' })
  async updateGeminiConfig(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: User,
    @Body() dto: UpdateGeminiConfigDto,
  ) {
    await this.companiesService.checkAdminAccessPublic(id, user.id);
    return this.geminiConfigService.updateConfig(id, dto);
  }

  @Post(':id/gemini-config/validate')
  @ApiOperation({ summary: 'Validate a Gemini API key' })
  async validateGeminiKey(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: User,
    @Body() dto: ValidateGeminiKeyDto,
  ) {
    await this.companiesService.checkAdminAccessPublic(id, user.id);
    return this.geminiConfigService.validateApiKey(dto.apiKey);
  }
}
