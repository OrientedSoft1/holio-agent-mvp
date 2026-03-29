import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { GifsService } from './gifs.service';

describe('GifsService', () => {
  let service: GifsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GifsService,
        { provide: ConfigService, useValue: { get: jest.fn().mockReturnValue('') } },
      ],
    }).compile();
    service = module.get(GifsService);
  });

  describe('trending', () => {
    it('should return fallback gifs when no API key', async () => {
      const result = await service.trending(10);
      expect(result).toHaveLength(10);
      expect(result[0]).toHaveProperty('id');
      expect(result[0]).toHaveProperty('url');
      expect(result[0]).toHaveProperty('previewUrl');
    });
  });

  describe('search', () => {
    it('should return empty array when no API key', async () => {
      const result = await service.search('cats', 10);
      expect(result).toEqual([]);
    });

    it('should return empty array for empty query', async () => {
      const result = await service.search('', 10);
      expect(result).toEqual([]);
    });
  });
});
