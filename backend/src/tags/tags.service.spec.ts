import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { TagsService } from './tags.service';
import { Tag } from './entities/tag.entity';
import { MessageTag } from './entities/message-tag.entity';

const mockTagRepo = {
  find: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  remove: jest.fn(),
};

const mockMessageTagRepo = {
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  remove: jest.fn(),
  find: jest.fn(),
};

describe('TagsService', () => {
  let service: TagsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TagsService,
        { provide: getRepositoryToken(Tag), useValue: mockTagRepo },
        { provide: getRepositoryToken(MessageTag), useValue: mockMessageTagRepo },
      ],
    }).compile();
    service = module.get(TagsService);
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return tags for a user', async () => {
      const tags = [{ id: '1', name: 'Important', emoji: '📌', userId: 'u1' }];
      mockTagRepo.find.mockResolvedValue(tags);
      const result = await service.findAll('u1');
      expect(result).toEqual(tags);
      expect(mockTagRepo.find).toHaveBeenCalledWith({ where: { userId: 'u1' }, order: { createdAt: 'ASC' } });
    });
  });

  describe('create', () => {
    it('should create and return a new tag', async () => {
      const tag = { id: '1', name: 'Test', emoji: '🧪', userId: 'u1' };
      mockTagRepo.create.mockReturnValue(tag);
      mockTagRepo.save.mockResolvedValue(tag);
      const result = await service.create('u1', { name: 'Test', emoji: '🧪' });
      expect(result).toEqual(tag);
    });
  });

  describe('remove', () => {
    it('should throw NotFoundException for non-existent tag', async () => {
      mockTagRepo.findOne.mockResolvedValue(null);
      await expect(service.remove('u1', 'nonexistent')).rejects.toThrow(NotFoundException);
    });
  });
});
