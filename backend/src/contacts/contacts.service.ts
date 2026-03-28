import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { Contact } from './entities/contact.entity.js';
import { AddContactDto, UpdateContactDto } from './dto/contact.dto.js';

@Injectable()
export class ContactsService {
  constructor(
    @InjectRepository(Contact)
    private readonly contactRepo: Repository<Contact>,
  ) {}

  async addContact(userId: string, dto: AddContactDto): Promise<Contact> {
    if (userId === dto.contactUserId) {
      throw new BadRequestException('Cannot add yourself as a contact');
    }

    const existing = await this.contactRepo.findOne({
      where: { userId, contactUserId: dto.contactUserId },
    });
    if (existing) {
      throw new ConflictException('Contact already exists');
    }

    const contact = this.contactRepo.create({
      userId,
      contactUserId: dto.contactUserId,
      nickname: dto.nickname ?? null,
    });

    return this.contactRepo.save(contact);
  }

  async getContacts(
    userId: string,
    search?: string,
    page = 1,
    limit = 50,
  ): Promise<{ data: Contact[]; total: number; page: number; limit: number }> {
    const qb = this.contactRepo
      .createQueryBuilder('contact')
      .leftJoinAndSelect('contact.contactUser', 'contactUser')
      .where('contact.userId = :userId', { userId })
      .andWhere('contact.isBlocked = false');

    if (search) {
      qb.andWhere(
        '(contactUser.firstName ILIKE :search OR contactUser.lastName ILIKE :search OR contactUser.username ILIKE :search OR contact.nickname ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    qb.orderBy('contact.isFavorite', 'DESC')
      .addOrderBy('contactUser.firstName', 'ASC')
      .skip((page - 1) * limit)
      .take(limit);

    const [data, total] = await qb.getManyAndCount();
    return { data, total, page, limit };
  }

  async getFavorites(userId: string): Promise<Contact[]> {
    return this.contactRepo.find({
      where: { userId, isFavorite: true, isBlocked: false },
      relations: ['contactUser'],
      order: { contactUser: { firstName: 'ASC' } },
    });
  }

  async getBlocked(userId: string): Promise<Contact[]> {
    return this.contactRepo.find({
      where: { userId, isBlocked: true },
      relations: ['contactUser'],
    });
  }

  async updateContact(
    userId: string,
    contactId: string,
    dto: UpdateContactDto,
  ): Promise<Contact> {
    const contact = await this.contactRepo.findOne({
      where: { id: contactId, userId },
      relations: ['contactUser'],
    });
    if (!contact) {
      throw new NotFoundException('Contact not found');
    }

    if (dto.nickname !== undefined) contact.nickname = dto.nickname ?? null;
    if (dto.isFavorite !== undefined) contact.isFavorite = dto.isFavorite;

    return this.contactRepo.save(contact);
  }

  async removeContact(userId: string, contactId: string): Promise<void> {
    const contact = await this.contactRepo.findOne({
      where: { id: contactId, userId },
    });
    if (!contact) {
      throw new NotFoundException('Contact not found');
    }
    await this.contactRepo.remove(contact);
  }

  async blockUser(userId: string, contactUserId: string): Promise<Contact> {
    let contact = await this.contactRepo.findOne({
      where: { userId, contactUserId },
      relations: ['contactUser'],
    });

    if (contact) {
      contact.isBlocked = true;
      return this.contactRepo.save(contact);
    }

    contact = this.contactRepo.create({
      userId,
      contactUserId,
      isBlocked: true,
    });
    return this.contactRepo.save(contact);
  }

  async unblockUser(userId: string, contactUserId: string): Promise<Contact> {
    const contact = await this.contactRepo.findOne({
      where: { userId, contactUserId },
      relations: ['contactUser'],
    });
    if (!contact) {
      throw new NotFoundException('Contact not found');
    }

    contact.isBlocked = false;
    return this.contactRepo.save(contact);
  }

  async isBlocked(userId: string, targetUserId: string): Promise<boolean> {
    const contact = await this.contactRepo.findOne({
      where: { userId, contactUserId: targetUserId, isBlocked: true },
    });
    return !!contact;
  }
}
