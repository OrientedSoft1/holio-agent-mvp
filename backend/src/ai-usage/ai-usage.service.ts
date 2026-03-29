import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BotTask } from '../bots/entities/bot-task.entity.js';
import { Bot } from '../bots/entities/bot.entity.js';
import { BedrockConfigService } from '../companies/bedrock-config.service.js';

const MODEL_PRICING: Record<
  string,
  { inputPer1K: number; outputPer1K: number }
> = {
  'anthropic.claude-sonnet': { inputPer1K: 0.003, outputPer1K: 0.015 },
  'anthropic.claude-haiku': { inputPer1K: 0.00025, outputPer1K: 0.00125 },
  'amazon.nova-pro': { inputPer1K: 0.0008, outputPer1K: 0.0032 },
  'amazon.nova-lite': { inputPer1K: 0.00006, outputPer1K: 0.00024 },
  'amazon.nova-micro': { inputPer1K: 0.000035, outputPer1K: 0.00014 },
  'meta.llama3': { inputPer1K: 0.00035, outputPer1K: 0.0004 },
  'mistralai.mistral': { inputPer1K: 0.00015, outputPer1K: 0.0002 },
};

const DEFAULT_PRICING = { inputPer1K: 0.003, outputPer1K: 0.015 };

interface UsageRow {
  totalTokens: string;
  totalTasks: string;
  completedTasks: string;
  failedTasks: string;
  avgResponseMs: string;
}

interface DailyRow {
  date: string;
  tokens: string;
  tasks: string;
}

interface BotRow {
  botId: string;
  tokens: string;
  tasks: string;
  avgResponseMs: string;
}

@Injectable()
export class AIUsageService {
  private readonly logger = new Logger(AIUsageService.name);

  constructor(
    @InjectRepository(BotTask)
    private readonly botTaskRepo: Repository<BotTask>,
    @InjectRepository(Bot)
    private readonly botRepo: Repository<Bot>,
    private readonly bedrockConfigService: BedrockConfigService,
  ) {}

  async getSummary(companyId: string) {
    const bots = await this.botRepo.find({ where: { companyId } });
    const botIds = bots.map((b) => b.id);

    if (botIds.length === 0) {
      return {
        totalTokens: 0,
        totalTasks: 0,
        completedTasks: 0,
        failedTasks: 0,
        avgResponseMs: 0,
        activeBots: 0,
        estimatedCost: 0,
        budgetLimit: null,
      };
    }

    const stats: UsageRow | undefined = await this.botTaskRepo
      .createQueryBuilder('task')
      .select('COUNT(*)', 'totalTasks')
      .addSelect('COALESCE(SUM(task.tokensUsed), 0)', 'totalTokens')
      .addSelect(
        "COUNT(*) FILTER (WHERE task.status = 'completed')",
        'completedTasks',
      )
      .addSelect(
        "COUNT(*) FILTER (WHERE task.status = 'failed')",
        'failedTasks',
      )
      .addSelect('COALESCE(AVG(task.durationMs), 0)', 'avgResponseMs')
      .where('task.botId IN (:...botIds)', { botIds })
      .getRawOne();

    const config = await this.bedrockConfigService.getConfig(companyId);

    const totalTokens = Number(stats?.totalTokens ?? 0);
    const estimatedCost = this.estimateCost(bots, totalTokens);

    return {
      totalTokens,
      totalTasks: Number(stats?.totalTasks ?? 0),
      completedTasks: Number(stats?.completedTasks ?? 0),
      failedTasks: Number(stats?.failedTasks ?? 0),
      avgResponseMs: Math.round(Number(stats?.avgResponseMs ?? 0)),
      activeBots: bots.filter((b) => b.isActive).length,
      estimatedCost,
      budgetLimit: config.maxTokensBudget ?? null,
    };
  }

  async getDailyUsage(companyId: string, days = 30) {
    const bots = await this.botRepo.find({ where: { companyId } });
    const botIds = bots.map((b) => b.id);

    if (botIds.length === 0) return [];

    const rows: DailyRow[] = await this.botTaskRepo
      .createQueryBuilder('task')
      .select("TO_CHAR(task.createdAt, 'YYYY-MM-DD')", 'date')
      .addSelect('COALESCE(SUM(task.tokensUsed), 0)', 'tokens')
      .addSelect('COUNT(*)', 'tasks')
      .where('task.botId IN (:...botIds)', { botIds })
      .andWhere(`task.createdAt >= NOW() - MAKE_INTERVAL(days => :days)`, {
        days,
      })
      .groupBy("TO_CHAR(task.createdAt, 'YYYY-MM-DD')")
      .orderBy("TO_CHAR(task.createdAt, 'YYYY-MM-DD')", 'ASC')
      .getRawMany();

    return rows.map((r) => ({
      date: r.date,
      tokens: Number(r.tokens),
      tasks: Number(r.tasks),
    }));
  }

  async getByModel(companyId: string) {
    const bots = await this.botRepo.find({ where: { companyId } });
    const botIds = bots.map((b) => b.id);

    if (botIds.length === 0) return [];

    const botModelMap = new Map(bots.map((b) => [b.id, b.modelId]));

    const rows: BotRow[] = await this.botTaskRepo
      .createQueryBuilder('task')
      .select('task.botId', 'botId')
      .addSelect('COALESCE(SUM(task.tokensUsed), 0)', 'tokens')
      .addSelect('COUNT(*)', 'tasks')
      .addSelect('COALESCE(AVG(task.durationMs), 0)', 'avgResponseMs')
      .where('task.botId IN (:...botIds)', { botIds })
      .groupBy('task.botId')
      .getRawMany();

    const modelMap = new Map<
      string,
      { tokens: number; tasks: number; totalMs: number; count: number }
    >();
    for (const row of rows) {
      const modelId = botModelMap.get(row.botId) ?? 'unknown';
      const existing = modelMap.get(modelId) ?? {
        tokens: 0,
        tasks: 0,
        totalMs: 0,
        count: 0,
      };
      existing.tokens += Number(row.tokens);
      existing.tasks += Number(row.tasks);
      existing.totalMs += Number(row.avgResponseMs) * Number(row.tasks);
      existing.count += Number(row.tasks);
      modelMap.set(modelId, existing);
    }

    return Array.from(modelMap.entries()).map(([modelId, data]) => ({
      modelId,
      tokens: data.tokens,
      tasks: data.tasks,
      avgResponseMs: data.count > 0 ? Math.round(data.totalMs / data.count) : 0,
    }));
  }

  async getByBot(companyId: string) {
    const bots = await this.botRepo.find({ where: { companyId } });
    const botIds = bots.map((b) => b.id);

    if (botIds.length === 0) return [];

    const rows: BotRow[] = await this.botTaskRepo
      .createQueryBuilder('task')
      .select('task.botId', 'botId')
      .addSelect('COALESCE(SUM(task.tokensUsed), 0)', 'tokens')
      .addSelect('COUNT(*)', 'tasks')
      .where('task.botId IN (:...botIds)', { botIds })
      .groupBy('task.botId')
      .orderBy('COALESCE(SUM(task.tokensUsed), 0)', 'DESC')
      .getRawMany();

    const botMap = new Map(bots.map((b) => [b.id, b]));

    return rows.map((r) => {
      const bot = botMap.get(r.botId);
      return {
        botId: r.botId,
        botName: bot?.name ?? 'Unknown',
        botType: bot?.type ?? 'custom',
        tokens: Number(r.tokens),
        tasks: Number(r.tasks),
      };
    });
  }

  private estimateCost(bots: Bot[], totalTokens: number): number {
    if (totalTokens === 0) return 0;
    const tokensPerBot = totalTokens / (bots.length || 1);
    let cost = 0;
    for (const bot of bots) {
      const pricing = MODEL_PRICING[bot.modelId] ?? DEFAULT_PRICING;
      cost +=
        (tokensPerBot / 1000) *
        ((pricing.inputPer1K + pricing.outputPer1K) / 2);
    }
    return Math.round(cost * 100) / 100;
  }
}
