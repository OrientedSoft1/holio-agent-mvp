import { Injectable, Logger } from '@nestjs/common';
import { Processor, Process } from '@nestjs/bull';
import type { Job } from 'bull';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BotTask } from '../bots/entities/bot-task.entity.js';
import { Bot } from '../bots/entities/bot.entity.js';
import { Message } from '../messages/entities/message.entity.js';
import { Company } from '../companies/entities/company.entity.js';
import { BedrockService } from '../bots/bedrock.service.js';
import { BotTaskStatus, SenderType, MessageType } from '../common/enums.js';

@Injectable()
@Processor('bot-tasks')
export class BotWorkerService {
  private readonly logger = new Logger(BotWorkerService.name);

  private messageEmitter: ((chatId: string, message: Message) => void) | null =
    null;

  constructor(
    @InjectRepository(BotTask)
    private readonly botTaskRepo: Repository<BotTask>,
    @InjectRepository(Bot)
    private readonly botRepo: Repository<Bot>,
    @InjectRepository(Message)
    private readonly messageRepo: Repository<Message>,
    @InjectRepository(Company)
    private readonly companyRepo: Repository<Company>,
    private readonly bedrockService: BedrockService,
  ) {}

  setMessageEmitter(emitter: (chatId: string, message: Message) => void) {
    this.messageEmitter = emitter;
  }

  @Process()
  async handleBotTask(job: Job<{ taskId: string }>) {
    const startTime = Date.now();
    const task = await this.botTaskRepo.findOne({
      where: { id: job.data.taskId },
    });
    if (!task) {
      this.logger.warn(`BotTask ${job.data.taskId} not found`);
      return;
    }

    try {
      task.status = BotTaskStatus.RUNNING;
      await this.botTaskRepo.save(task);

      const bot = await this.botRepo.findOne({ where: { id: task.botId } });
      if (!bot) throw new Error(`Bot ${task.botId} not found`);

      const company = await this.companyRepo.findOne({
        where: { id: bot.companyId },
      });

      const recentMessages = await this.messageRepo.find({
        where: { chatId: task.chatId },
        order: { createdAt: 'DESC' },
        take: 20,
        relations: ['sender'],
      });

      const conversationMessages: Array<{ role: 'user' | 'assistant'; content: string }> = recentMessages
        .reverse()
        .map((msg) => ({
          role: (msg.senderType === SenderType.BOT ? 'assistant' : 'user') as 'user' | 'assistant',
          content:
            msg.senderType === SenderType.USER && msg.sender
              ? `[${msg.sender.firstName ?? msg.sender.username ?? 'User'}]: ${msg.content ?? ''}`
              : (msg.content ?? ''),
        }))
        .filter((m) => m.content.length > 0);

      if (conversationMessages.length === 0) {
        conversationMessages.push({
          role: 'user' as const,
          content: task.input ?? 'Hello',
        });
      }

      if (
        conversationMessages[conversationMessages.length - 1].role !== 'user'
      ) {
        conversationMessages.push({
          role: 'user' as const,
          content: task.input ?? 'Please respond.',
        });
      }

      const result = await this.bedrockService.invokeModel({
        modelId: bot.modelId,
        systemPrompt: bot.systemPrompt,
        messages: conversationMessages,
        temperature: bot.temperature,
        maxTokens: bot.maxTokens,
        region: company?.bedrockRegion ?? 'eu-west-1',
      });

      const botMessage = this.messageRepo.create({
        chatId: task.chatId,
        senderId: bot.id,
        senderType: SenderType.BOT,
        type: MessageType.BOT_RESULT,
        content: result.content,
        metadata: {
          botId: bot.id,
          botName: bot.name,
          taskId: task.id,
          tokensUsed: result.tokensUsed,
        },
      });
      const savedMessage = await this.messageRepo.save(botMessage);

      const durationMs = Date.now() - startTime;
      task.status = BotTaskStatus.COMPLETED;
      task.output = result.content;
      task.tokensUsed = result.tokensUsed;
      task.durationMs = durationMs;
      await this.botTaskRepo.save(task);

      if (this.messageEmitter) {
        this.messageEmitter(task.chatId, savedMessage);
      }

      this.logger.log(
        `Bot task ${task.id} completed in ${durationMs}ms (${result.tokensUsed} tokens)`,
      );
    } catch (error) {
      const durationMs = Date.now() - startTime;
      task.status = BotTaskStatus.FAILED;
      task.error = error instanceof Error ? error.message : String(error);
      task.durationMs = durationMs;
      await this.botTaskRepo.save(task);

      this.logger.error(`Bot task ${task.id} failed: ${task.error}`);
      throw error;
    }
  }
}
