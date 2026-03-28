import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
  Logger,
  OnModuleInit,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InjectQueue } from '@nestjs/bull';
import type { Queue } from 'bull';
import { Bot } from './entities/bot.entity.js';
import { BotChatMember } from './entities/bot-chat-member.entity.js';
import { BotTask } from './entities/bot-task.entity.js';
import { BotTemplate } from './entities/bot-template.entity.js';
import { CompanyMember } from '../companies/entities/company-member.entity.js';
import { CreateBotDto } from './dto/create-bot.dto.js';
import { UpdateBotDto } from './dto/update-bot.dto.js';
import { CompanyRole, BotType, BotTaskStatus } from '../common/enums.js';

@Injectable()
export class BotsService implements OnModuleInit {
  private readonly logger = new Logger(BotsService.name);

  constructor(
    @InjectRepository(Bot)
    private readonly botRepo: Repository<Bot>,
    @InjectRepository(BotChatMember)
    private readonly botChatMemberRepo: Repository<BotChatMember>,
    @InjectRepository(BotTask)
    private readonly botTaskRepo: Repository<BotTask>,
    @InjectRepository(BotTemplate)
    private readonly templateRepo: Repository<BotTemplate>,
    @InjectRepository(CompanyMember)
    private readonly companyMemberRepo: Repository<CompanyMember>,
    @InjectQueue('bot-tasks')
    private readonly botTaskQueue: Queue,
  ) {}

  async onModuleInit() {
    await this.seedTemplates();
  }

  // ──── Bot CRUD ────

  async create(userId: string, dto: CreateBotDto): Promise<Bot> {
    await this.checkCompanyAdmin(dto.companyId, userId);

    const bot = this.botRepo.create({
      companyId: dto.companyId,
      name: dto.name,
      description: dto.description ?? null,
      type: dto.type,
      systemPrompt: dto.systemPrompt,
      modelId: dto.modelId ?? 'anthropic.claude-sonnet',
      temperature: dto.temperature ?? 0.7,
      maxTokens: dto.maxTokens ?? 2048,
      tools: dto.tools ?? [],
      createdBy: userId,
    });

    return this.botRepo.save(bot);
  }

  async findAllForCompany(companyId: string): Promise<Bot[]> {
    return this.botRepo.find({
      where: { companyId, isActive: true },
      relations: ['creator'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Bot> {
    const bot = await this.botRepo.findOne({
      where: { id },
      relations: ['creator', 'company'],
    });
    if (!bot) {
      throw new NotFoundException('Bot not found');
    }
    return bot;
  }

  async update(id: string, userId: string, dto: UpdateBotDto): Promise<Bot> {
    const bot = await this.findOne(id);
    await this.checkCompanyAdmin(bot.companyId, userId);

    if (dto.name !== undefined) bot.name = dto.name;
    if (dto.description !== undefined)
      bot.description = dto.description ?? null;
    if (dto.systemPrompt !== undefined) bot.systemPrompt = dto.systemPrompt;
    if (dto.modelId !== undefined) bot.modelId = dto.modelId;
    if (dto.temperature !== undefined) bot.temperature = dto.temperature;
    if (dto.maxTokens !== undefined) bot.maxTokens = dto.maxTokens;
    if (dto.tools !== undefined) bot.tools = dto.tools;
    if (dto.isActive !== undefined) bot.isActive = dto.isActive;
    if (dto.avatarUrl !== undefined) bot.avatarUrl = dto.avatarUrl ?? null;

    return this.botRepo.save(bot);
  }

  async remove(id: string, userId: string): Promise<void> {
    const bot = await this.findOne(id);
    await this.checkCompanyAdmin(bot.companyId, userId);

    bot.isActive = false;
    await this.botRepo.save(bot);
  }

  // ──── Chat membership ────

  async inviteToChat(
    botId: string,
    chatId: string,
    userId: string,
  ): Promise<BotChatMember> {
    const bot = await this.findOne(botId);
    if (!bot.isActive) {
      throw new ForbiddenException('Bot is deactivated');
    }

    const existing = await this.botChatMemberRepo.findOne({
      where: { botId, chatId },
    });
    if (existing) {
      throw new ConflictException('Bot is already in this chat');
    }

    const member = this.botChatMemberRepo.create({
      botId,
      chatId,
      addedByUserId: userId,
    });
    return this.botChatMemberRepo.save(member);
  }

  async removeFromChat(
    botId: string,
    chatId: string,
    _userId: string,
  ): Promise<void> {
    const member = await this.botChatMemberRepo.findOne({
      where: { botId, chatId },
    });
    if (!member) {
      throw new NotFoundException('Bot is not in this chat');
    }
    await this.botChatMemberRepo.remove(member);
  }

  async getBotsInChat(chatId: string): Promise<Bot[]> {
    const members = await this.botChatMemberRepo.find({
      where: { chatId },
      relations: ['bot'],
    });
    return members.map((m) => m.bot).filter((b) => b.isActive);
  }

  // ──── @mention detection + task queueing ────

  async handleMentions(
    messageContent: string,
    chatId: string,
    messageId: string,
  ): Promise<void> {
    const botsInChat = await this.getBotsInChat(chatId);
    if (botsInChat.length === 0) return;

    for (const bot of botsInChat) {
      const mentionPattern = `@${bot.name}`;
      if (messageContent.includes(mentionPattern)) {
        await this.createAndQueueTask(
          bot.id,
          chatId,
          messageId,
          messageContent,
        );
      }
    }
  }

  async createAndQueueTask(
    botId: string,
    chatId: string,
    triggerMessageId: string,
    input: string,
  ): Promise<BotTask> {
    const task = this.botTaskRepo.create({
      botId,
      chatId,
      triggerMessageId,
      status: BotTaskStatus.QUEUED,
      input,
    });
    const saved = await this.botTaskRepo.save(task);

    try {
      await this.botTaskQueue.add(
        { taskId: saved.id },
        { attempts: 3, backoff: 5000 },
      );
    } catch (error) {
      this.logger.warn(`Failed to queue bot task ${saved.id}: ${error}`);
      saved.status = BotTaskStatus.FAILED;
      saved.error = 'Failed to queue task — Redis may be unavailable';
      await this.botTaskRepo.save(saved);
    }

    return saved;
  }

  // ──── Templates ────

  async getTemplates(): Promise<BotTemplate[]> {
    return this.templateRepo.find({ order: { category: 'ASC' } });
  }

  async createFromTemplate(
    userId: string,
    companyId: string,
    templateId: string,
  ): Promise<Bot> {
    await this.checkCompanyAdmin(companyId, userId);

    const template = await this.templateRepo.findOne({
      where: { id: templateId },
    });
    if (!template) {
      throw new NotFoundException('Template not found');
    }

    const bot = this.botRepo.create({
      companyId,
      name: template.name,
      description: template.description,
      type: template.category as BotType,
      systemPrompt: template.defaultSystemPrompt,
      modelId: template.defaultModelId,
      tools: template.defaultTools,
      createdBy: userId,
    });

    return this.botRepo.save(bot);
  }

  // ──── Audit / Stats (Issue #29) ────

  async getTaskHistory(botId: string, page = 1, limit = 20) {
    const [data, total] = await this.botTaskRepo.findAndCount({
      where: { botId },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { data, total, page, limit };
  }

  async getCompanyBotStats(companyId: string) {
    const bots = await this.botRepo.find({
      where: { companyId },
      select: ['id'],
    });
    const botIds = bots.map((b) => b.id);

    if (botIds.length === 0) {
      return {
        totalTasks: 0,
        totalTokensUsed: 0,
        avgDurationMs: 0,
        botCount: 0,
      };
    }

    const stats = await this.botTaskRepo
      .createQueryBuilder('task')
      .select('COUNT(task.id)', 'totalTasks')
      .addSelect('COALESCE(SUM(task.tokensUsed), 0)', 'totalTokensUsed')
      .addSelect('COALESCE(AVG(task.durationMs), 0)', 'avgDurationMs')
      .where('task.botId IN (:...botIds)', { botIds })
      .getRawOne();

    return {
      totalTasks: parseInt(stats.totalTasks, 10),
      totalTokensUsed: parseInt(stats.totalTokensUsed, 10),
      avgDurationMs: Math.round(parseFloat(stats.avgDurationMs)),
      botCount: botIds.length,
    };
  }

  // ──── Helpers ────

  private async checkCompanyAdmin(
    companyId: string,
    userId: string,
  ): Promise<CompanyMember> {
    const member = await this.companyMemberRepo.findOne({
      where: { companyId, userId },
    });
    if (!member) {
      throw new ForbiddenException('You are not a member of this company');
    }
    if (
      member.role !== CompanyRole.OWNER &&
      member.role !== CompanyRole.ADMIN
    ) {
      throw new ForbiddenException('Only admins and owners can manage bots');
    }
    return member;
  }

  private async seedTemplates(): Promise<void> {
    const count = await this.templateRepo.count();
    if (count > 0) return;

    const templates: Array<Partial<BotTemplate>> = [
      {
        name: 'Financial Analyst',
        description:
          'AI agent specializing in financial analysis, budgeting, forecasting, and financial reporting.',
        category: BotType.CFO,
        defaultSystemPrompt:
          'You are a senior financial analyst AI agent. You help with financial analysis, budgeting, forecasting, ' +
          'cash flow management, and financial reporting. Provide data-driven insights, create financial summaries, ' +
          'and help with financial decision-making. Always present numbers clearly and explain financial concepts ' +
          'in accessible terms. When unsure, ask for clarification rather than making assumptions about financial data.',
        defaultModelId: 'anthropic.claude-sonnet',
        defaultTools: [],
      },
      {
        name: 'Marketing Strategist',
        description:
          'AI agent for content creation, campaign analysis, SEO optimization, and marketing strategy.',
        category: BotType.MARKETING,
        defaultSystemPrompt:
          'You are a marketing strategist AI agent. You assist with content creation, campaign planning and analysis, ' +
          'SEO optimization, social media strategy, and brand messaging. Provide creative yet data-informed suggestions. ' +
          'Help draft copy, analyze campaign performance metrics, and suggest improvements. Adapt your tone to match ' +
          'the brand voice described by the user.',
        defaultModelId: 'anthropic.claude-sonnet',
        defaultTools: [],
      },
      {
        name: 'HR Assistant',
        description:
          'AI agent for employee policies, onboarding processes, and HR-related queries.',
        category: BotType.HR,
        defaultSystemPrompt:
          'You are an HR assistant AI agent. You help with employee handbook questions, company policies, ' +
          'onboarding processes, benefits information, and general HR inquiries. Be empathetic, precise, and ' +
          'always recommend consulting with the actual HR department for sensitive matters. Help draft HR ' +
          'communications and policy documents when asked.',
        defaultModelId: 'anthropic.claude-sonnet',
        defaultTools: [],
      },
      {
        name: 'Customer Support Agent',
        description:
          'AI agent for FAQ handling, ticket triage, and customer response drafting.',
        category: BotType.SUPPORT,
        defaultSystemPrompt:
          'You are a customer support AI agent. You help handle frequently asked questions, triage support tickets, ' +
          'draft customer responses, and identify common issues. Be friendly, professional, and solution-oriented. ' +
          'Escalate complex issues by recommending the user contact a human support agent. Track and summarize ' +
          'recurring issues when asked.',
        defaultModelId: 'anthropic.claude-sonnet',
        defaultTools: [],
      },
      {
        name: 'DevOps Engineer',
        description:
          'AI agent for infrastructure monitoring, deployment status, and incident response.',
        category: BotType.DEVOPS,
        defaultSystemPrompt:
          'You are a DevOps engineer AI agent. You assist with infrastructure monitoring questions, deployment ' +
          'status checks, incident response procedures, and infrastructure-as-code guidance. Provide clear, ' +
          'actionable advice for system administration tasks. Help write configuration files, troubleshoot ' +
          'deployment issues, and document infrastructure decisions.',
        defaultModelId: 'anthropic.claude-sonnet',
        defaultTools: [],
      },
      {
        name: 'Custom AI Agent',
        description:
          'A general-purpose AI agent that can be customized with your own system prompt and tools.',
        category: BotType.CUSTOM,
        defaultSystemPrompt:
          'You are a helpful AI assistant. Answer questions accurately and helpfully. ' +
          'If you are unsure about something, say so rather than guessing.',
        defaultModelId: 'anthropic.claude-sonnet',
        defaultTools: [],
      },
    ];

    await this.templateRepo.save(
      templates.map((t) => this.templateRepo.create(t)),
    );
    this.logger.log(`Seeded ${templates.length} bot templates`);
  }
}
