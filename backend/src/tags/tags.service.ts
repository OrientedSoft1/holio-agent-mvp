import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tag } from './entities/tag.entity.js';
import { MessageTag } from './entities/message-tag.entity.js';
import { CreateTagDto, UpdateTagDto } from './dto/tag.dto.js';

@Injectable()
export class TagsService {
  constructor(
    @InjectRepository(Tag)
    private readonly tagRepo: Repository<Tag>,
    @InjectRepository(MessageTag)
    private readonly messageTagRepo: Repository<MessageTag>,
  ) {}

  async create(userId: string, dto: CreateTagDto): Promise<Tag> {
    const tag = this.tagRepo.create({
      userId,
      emoji: dto.emoji,
      name: dto.name,
    });
    return this.tagRepo.save(tag);
  }

  async findAll(userId: string): Promise<Tag[]> {
    return this.tagRepo.find({
      where: { userId },
      order: { createdAt: 'ASC' },
    });
  }

  async update(userId: string, tagId: string, dto: UpdateTagDto): Promise<Tag> {
    const tag = await this.tagRepo.findOne({
      where: { id: tagId, userId },
    });
    if (!tag) {
      throw new NotFoundException('Tag not found');
    }

    if (dto.emoji !== undefined) tag.emoji = dto.emoji;
    if (dto.name !== undefined) tag.name = dto.name;

    return this.tagRepo.save(tag);
  }

  async remove(userId: string, tagId: string): Promise<void> {
    const tag = await this.tagRepo.findOne({
      where: { id: tagId, userId },
    });
    if (!tag) {
      throw new NotFoundException('Tag not found');
    }
    await this.tagRepo.remove(tag);
  }

  async addTagToMessage(
    userId: string,
    messageId: string,
    tagId: string,
  ): Promise<MessageTag> {
    const tag = await this.tagRepo.findOne({
      where: { id: tagId, userId },
    });
    if (!tag) {
      throw new NotFoundException('Tag not found');
    }

    const messageTag = this.messageTagRepo.create({
      userId,
      messageId,
      tagId,
    });
    return this.messageTagRepo.save(messageTag);
  }

  async removeTagFromMessage(
    userId: string,
    messageId: string,
    tagId: string,
  ): Promise<void> {
    const messageTag = await this.messageTagRepo.findOne({
      where: { messageId, tagId, userId },
    });
    if (!messageTag) {
      throw new NotFoundException('Message tag not found');
    }
    await this.messageTagRepo.remove(messageTag);
  }

  async findMessagesByTag(userId: string, tagId: string) {
    const tag = await this.tagRepo.findOne({
      where: { id: tagId, userId },
    });
    if (!tag) {
      throw new NotFoundException('Tag not found');
    }

    const messageTags = await this.messageTagRepo.find({
      where: { tagId, userId },
      relations: ['message', 'message.sender'],
      order: { createdAt: 'DESC' },
    });

    return messageTags.map((mt) => mt.message);
  }
}
