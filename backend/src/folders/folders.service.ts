import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ChatFolder } from './entities/chat-folder.entity.js';
import { CreateFolderDto, UpdateFolderDto } from './dto/folder.dto.js';

@Injectable()
export class FoldersService {
  constructor(
    @InjectRepository(ChatFolder)
    private readonly folderRepo: Repository<ChatFolder>,
  ) {}

  async create(userId: string, dto: CreateFolderDto): Promise<ChatFolder> {
    const maxOrder = await this.folderRepo
      .createQueryBuilder('f')
      .select('COALESCE(MAX(f.order), -1)', 'max')
      .where('f.userId = :userId', { userId })
      .getRawOne<{ max: number }>();

    const folder = this.folderRepo.create({
      userId,
      name: dto.name,
      icon: dto.icon ?? null,
      filters: dto.filters ?? {},
      chatIds: dto.chatIds ?? [],
      order: (maxOrder?.max ?? -1) + 1,
    });

    return this.folderRepo.save(folder);
  }

  async findAll(userId: string): Promise<ChatFolder[]> {
    return this.folderRepo.find({
      where: { userId },
      order: { order: 'ASC' },
    });
  }

  async update(
    userId: string,
    folderId: string,
    dto: UpdateFolderDto,
  ): Promise<ChatFolder> {
    const folder = await this.folderRepo.findOne({
      where: { id: folderId, userId },
    });
    if (!folder) {
      throw new NotFoundException('Folder not found');
    }

    if (dto.name !== undefined) folder.name = dto.name;
    if (dto.icon !== undefined) folder.icon = dto.icon ?? null;
    if (dto.filters !== undefined) folder.filters = dto.filters;
    if (dto.chatIds !== undefined) folder.chatIds = dto.chatIds;
    if (dto.order !== undefined) folder.order = dto.order;

    return this.folderRepo.save(folder);
  }

  async remove(userId: string, folderId: string): Promise<void> {
    const folder = await this.folderRepo.findOne({
      where: { id: folderId, userId },
    });
    if (!folder) {
      throw new NotFoundException('Folder not found');
    }
    await this.folderRepo.remove(folder);
  }
}
