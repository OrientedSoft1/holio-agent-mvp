import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Call } from './entities/call.entity.js';
import { CreateCallDto } from './dto/call.dto.js';

@Injectable()
export class CallsService {
  constructor(
    @InjectRepository(Call)
    private readonly callRepo: Repository<Call>,
  ) {}

  async findAll(
    userId: string,
    page = 1,
    limit = 20,
  ): Promise<{ data: Call[]; total: number; page: number; limit: number }> {
    const [data, total] = await this.callRepo.findAndCount({
      where: [{ callerId: userId }, { receiverId: userId }],
      relations: ['caller', 'receiver'],
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return { data, total, page, limit };
  }

  async findRecent(userId: string): Promise<Call[]> {
    return this.callRepo.find({
      where: [{ callerId: userId }, { receiverId: userId }],
      relations: ['caller', 'receiver'],
      order: { createdAt: 'DESC' },
      take: 20,
    });
  }

  async create(callerId: string, dto: CreateCallDto): Promise<Call> {
    const call = this.callRepo.create({
      callerId,
      receiverId: dto.receiverId,
      chatId: dto.chatId ?? null,
      callType: dto.callType,
      direction: dto.direction,
    });

    return this.callRepo.save(call);
  }

  async findOne(userId: string, callId: string): Promise<Call> {
    const call = await this.callRepo.findOne({
      where: [
        { id: callId, callerId: userId },
        { id: callId, receiverId: userId },
      ],
      relations: ['caller', 'receiver'],
    });

    if (!call) {
      throw new NotFoundException('Call not found');
    }

    return call;
  }
}
