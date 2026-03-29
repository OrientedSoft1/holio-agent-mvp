import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { SubscriptionsService } from './subscriptions.service';
import { Subscription } from './entities/subscription.entity';

const mockRepo = {
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
};

describe('SubscriptionsService', () => {
  let service: SubscriptionsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SubscriptionsService,
        { provide: getRepositoryToken(Subscription), useValue: mockRepo },
      ],
    }).compile();
    service = module.get(SubscriptionsService);
    jest.clearAllMocks();
  });

  describe('getPlans', () => {
    it('should return two plans', () => {
      const plans = service.getPlans();
      expect(plans).toHaveLength(2);
      expect(plans[0].interval).toBe('annual');
      expect(plans[1].interval).toBe('monthly');
    });

    it('should include pricing info', () => {
      const plans = service.getPlans();
      expect(plans[0].pricePerMonth).toBeDefined();
      expect(plans[0].currency).toBe('USD');
    });
  });

  describe('findByUser', () => {
    it('should return null when no subscription exists', async () => {
      mockRepo.findOne.mockResolvedValue(null);
      const result = await service.findByUser('user-1');
      expect(result).toBeNull();
    });

    it('should return subscription with daysLeft', async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 15);
      mockRepo.findOne.mockResolvedValue({
        id: 'sub-1',
        planId: 'plan-monthly',
        planName: 'Holio Pro Monthly',
        interval: 'monthly',
        status: 'active',
        currentPeriodEnd: futureDate,
      });
      const result = await service.findByUser('user-1');
      expect(result).not.toBeNull();
      expect(result!.daysLeft).toBeGreaterThan(0);
      expect(result!.totalDays).toBe(30);
    });
  });

  describe('subscribe', () => {
    it('should throw NotFoundException for invalid plan', async () => {
      await expect(service.subscribe('user-1', 'invalid-plan')).rejects.toThrow(NotFoundException);
    });

    it('should create a subscription for valid plan', async () => {
      mockRepo.create.mockImplementation((data) => data);
      mockRepo.save.mockImplementation((data) => Promise.resolve(data));
      const result = await service.subscribe('user-1', 'plan-monthly');
      expect(result.message).toBe('Subscription created');
      expect(mockRepo.save).toHaveBeenCalled();
    });
  });

  describe('cancel', () => {
    it('should cancel active subscription', async () => {
      const sub = { id: 'sub-1', status: 'active' };
      mockRepo.findOne.mockResolvedValue(sub);
      mockRepo.save.mockResolvedValue({ ...sub, status: 'cancelled' });
      await service.cancel('user-1');
      expect(mockRepo.save).toHaveBeenCalledWith(expect.objectContaining({ status: 'cancelled' }));
    });

    it('should do nothing when no active subscription', async () => {
      mockRepo.findOne.mockResolvedValue(null);
      await service.cancel('user-1');
      expect(mockRepo.save).not.toHaveBeenCalled();
    });
  });
});
