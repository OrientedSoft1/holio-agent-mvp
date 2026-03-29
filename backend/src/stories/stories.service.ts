import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan, In } from 'typeorm';
import { Story } from './entities/story.entity.js';
import { StoryView } from './entities/story-view.entity.js';
import { ChatMember } from '../chats/entities/chat-member.entity.js';
import { CreateStoryDto } from './dto/create-story.dto.js';
import { StoryPrivacy } from '../common/enums.js';

const STORY_DURATION_MS = 24 * 60 * 60 * 1000;

@Injectable()
export class StoriesService {
  constructor(
    @InjectRepository(Story)
    private readonly storyRepo: Repository<Story>,
    @InjectRepository(StoryView)
    private readonly viewRepo: Repository<StoryView>,
    @InjectRepository(ChatMember)
    private readonly chatMemberRepo: Repository<ChatMember>,
  ) {}

  async create(userId: string, dto: CreateStoryDto): Promise<Story> {
    const story = this.storyRepo.create({
      userId,
      mediaUrl: dto.mediaUrl,
      mediaType: dto.mediaType,
      caption: dto.caption ?? null,
      privacyLevel: dto.privacyLevel ?? StoryPrivacy.CONTACTS,
      allowedUserIds: dto.allowedUserIds ?? [],
      expiresAt: new Date(Date.now() + STORY_DURATION_MS),
    });
    const saved = await this.storyRepo.save(story);
    return this.storyRepo.findOne({
      where: { id: saved.id },
      relations: ['user'],
    }) as Promise<Story>;
  }

  async findForUser(viewerUserId: string) {
    const stories = await this.storyRepo.find({
      where: { expiresAt: MoreThan(new Date()) },
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });

    const contactChatIds = await this.chatMemberRepo.find({
      where: { userId: viewerUserId },
      select: ['chatId'],
    });
    const chatIds = contactChatIds.map((m) => m.chatId);

    let contactUserIds: string[] = [];
    if (chatIds.length > 0) {
      const coMembers = await this.chatMemberRepo.find({
        where: { chatId: In(chatIds) },
        select: ['userId'],
      });
      contactUserIds = [...new Set(coMembers.map((m) => m.userId))];
    }

    const visible = stories.filter((story) => {
      if (story.userId === viewerUserId) return true;

      switch (story.privacyLevel) {
        case StoryPrivacy.EVERYONE:
          return true;
        case StoryPrivacy.CONTACTS:
          return contactUserIds.includes(story.userId);
        case StoryPrivacy.CLOSE_FRIENDS:
          return contactUserIds.includes(story.userId);
        case StoryPrivacy.SELECTED:
          return story.allowedUserIds.includes(viewerUserId);
        default:
          return false;
      }
    });

    const viewedStoryIds = await this.viewRepo
      .find({
        where: {
          viewerId: viewerUserId,
          storyId: In(
            visible
              .map((s) => s.id)
              .concat(['00000000-0000-0000-0000-000000000000']),
          ),
        },
        select: ['storyId'],
      })
      .then((views) => new Set(views.map((v) => v.storyId)));

    const grouped = new Map<
      string,
      { user: Story['user']; stories: (Story & { viewed: boolean })[] }
    >();

    for (const story of visible) {
      const entry = grouped.get(story.userId) ?? {
        user: story.user,
        stories: [],
      };
      entry.stories.push({
        ...story,
        viewed: viewedStoryIds.has(story.id),
      });
      grouped.set(story.userId, entry);
    }

    return Array.from(grouped.values());
  }

  async view(storyId: string, viewerUserId: string): Promise<StoryView> {
    const story = await this.storyRepo.findOne({ where: { id: storyId } });
    if (!story) throw new NotFoundException('Story not found');
    if (story.expiresAt < new Date())
      throw new NotFoundException('Story has expired');

    const existing = await this.viewRepo.findOne({
      where: { storyId, viewerId: viewerUserId },
    });
    if (existing) return existing;

    const view = this.viewRepo.create({
      storyId,
      viewerId: viewerUserId,
    });
    return this.viewRepo.save(view);
  }

  async react(
    storyId: string,
    viewerUserId: string,
    emoji: string,
  ): Promise<StoryView> {
    const story = await this.storyRepo.findOne({ where: { id: storyId } });
    if (!story) throw new NotFoundException('Story not found');

    let view = await this.viewRepo.findOne({
      where: { storyId, viewerId: viewerUserId },
    });
    if (!view) {
      view = this.viewRepo.create({ storyId, viewerId: viewerUserId });
    }
    view.reaction = emoji;
    return this.viewRepo.save(view);
  }

  async reply(
    storyId: string,
    userId: string,
    content: string,
  ): Promise<{
    success: boolean;
    storyId: string;
    from: string;
    content: string;
  }> {
    const story = await this.storyRepo.findOne({
      where: { id: storyId },
      relations: ['user'],
    });
    if (!story) throw new NotFoundException('Story not found');

    return { success: true, storyId, from: userId, content };
  }

  async getViewers(storyId: string, userId: string): Promise<StoryView[]> {
    const story = await this.storyRepo.findOne({ where: { id: storyId } });
    if (!story) throw new NotFoundException('Story not found');
    if (story.userId !== userId)
      throw new ForbiddenException('Only the story owner can view viewers');

    return this.viewRepo.find({
      where: { storyId },
      relations: ['viewer'],
      order: { viewedAt: 'DESC' },
    });
  }

  async delete(storyId: string, userId: string): Promise<void> {
    const story = await this.storyRepo.findOne({ where: { id: storyId } });
    if (!story) throw new NotFoundException('Story not found');
    if (story.userId !== userId)
      throw new ForbiddenException('Only the story owner can delete it');
    await this.storyRepo.remove(story);
  }

  async deleteExpired(): Promise<number> {
    const result = await this.storyRepo
      .createQueryBuilder()
      .delete()
      .where('"expiresAt" < NOW()')
      .execute();
    return result.affected ?? 0;
  }
}
