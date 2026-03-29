import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Subscription } from './entities/subscription.entity.js';

@Injectable()
export class SubscriptionsService {
  constructor(
    @InjectRepository(Subscription)
    private readonly subRepo: Repository<Subscription>,
  ) {}

  getPlans() {
    return [
      {
        id: 'plan-annual',
        name: 'Holio Pro Annual',
        interval: 'annual',
        pricePerMonth: 3.99,
        totalPerYear: 47.88,
        discount: '-40%',
        currency: 'USD',
      },
      {
        id: 'plan-monthly',
        name: 'Holio Pro Monthly',
        interval: 'monthly',
        pricePerMonth: 5.99,
        totalPerYear: null,
        discount: null,
        currency: 'USD',
      },
    ];
  }

  async findByUser(userId: string) {
    const sub = await this.subRepo.findOne({
      where: { userId, status: 'active' },
      order: { createdAt: 'DESC' },
    });

    if (!sub) return null;

    const now = new Date();
    const end = sub.currentPeriodEnd ? new Date(sub.currentPeriodEnd) : now;
    const totalDays = sub.interval === 'annual' ? 365 : 30;
    const daysLeft = Math.max(
      0,
      Math.ceil((end.getTime() - now.getTime()) / 86400000),
    );

    return {
      id: sub.id,
      planId: sub.planId,
      planName: sub.planName,
      interval: sub.interval,
      status: sub.status,
      daysLeft,
      totalDays,
      currentPeriodEnd: sub.currentPeriodEnd?.toISOString() ?? null,
    };
  }

  async subscribe(userId: string, planId: string) {
    const plan = this.getPlans().find((p) => p.id === planId);
    if (!plan) throw new NotFoundException('Plan not found');

    const periodEnd = new Date();
    periodEnd.setDate(
      periodEnd.getDate() + (plan.interval === 'annual' ? 365 : 30),
    );

    const sub = this.subRepo.create({
      userId,
      planId: plan.id,
      planName: plan.name,
      interval: plan.interval,
      status: 'active',
      currentPeriodEnd: periodEnd,
    });

    await this.subRepo.save(sub);
    return { checkoutUrl: null, message: 'Subscription created' };
  }

  async cancel(userId: string) {
    const sub = await this.subRepo.findOne({
      where: { userId, status: 'active' },
    });
    if (sub) {
      sub.status = 'cancelled';
      await this.subRepo.save(sub);
    }
  }
}
