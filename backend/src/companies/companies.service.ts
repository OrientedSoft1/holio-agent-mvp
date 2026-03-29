import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { randomUUID } from 'crypto';
import { Company } from './entities/company.entity.js';
import { CompanyMember } from './entities/company-member.entity.js';
import { CompanyInvitation } from './entities/company-invitation.entity.js';
import { CreateCompanyDto } from './dto/create-company.dto.js';
import { UpdateCompanyDto } from './dto/update-company.dto.js';
import { InviteMemberDto } from './dto/invite-member.dto.js';
import { CompanyRole, InvitationStatus } from '../common/enums.js';

@Injectable()
export class CompaniesService {
  constructor(
    @InjectRepository(Company)
    private readonly companyRepo: Repository<Company>,
    @InjectRepository(CompanyMember)
    private readonly memberRepo: Repository<CompanyMember>,
    @InjectRepository(CompanyInvitation)
    private readonly invitationRepo: Repository<CompanyInvitation>,
  ) {}

  // ──── CRUD ────

  async create(userId: string, dto: CreateCompanyDto): Promise<Company> {
    const slug = await this.generateSlug(dto.name);

    const company = this.companyRepo.create({
      name: dto.name,
      description: dto.description ?? null,
      slug,
      ownerId: userId,
    });
    const saved = await this.companyRepo.save(company);

    const member = this.memberRepo.create({
      companyId: saved.id,
      userId,
      role: CompanyRole.OWNER,
    });
    await this.memberRepo.save(member);

    return saved;
  }

  async findAllForUser(userId: string) {
    const members = await this.memberRepo.find({
      where: { userId },
      relations: ['company'],
    });

    const results = await Promise.all(
      members.map(async (m) => {
        const memberCount = await this.memberRepo.count({
          where: { companyId: m.companyId },
        });
        return { ...m.company, memberCount, myRole: m.role };
      }),
    );

    return results;
  }

  async findOne(id: string): Promise<Company> {
    const company = await this.companyRepo.findOne({
      where: { id },
      relations: ['owner'],
    });
    if (!company) {
      throw new NotFoundException('Company not found');
    }
    return company;
  }

  async update(
    id: string,
    userId: string,
    dto: UpdateCompanyDto,
  ): Promise<Company> {
    await this.checkAdminAccess(id, userId);
    const company = await this.findOne(id);

    if (dto.name !== undefined) company.name = dto.name;
    if (dto.description !== undefined) company.description = dto.description;
    if (dto.logoUrl !== undefined) company.logoUrl = dto.logoUrl;
    if (dto.settings !== undefined) {
      company.settings = { ...company.settings, ...dto.settings };
    }
    if (dto.bedrockRegion !== undefined) {
      company.bedrockRegion = dto.bedrockRegion;
    }

    return this.companyRepo.save(company);
  }

  async remove(id: string, userId: string): Promise<void> {
    const member = await this.checkMembership(id, userId);
    if (member.role !== CompanyRole.OWNER) {
      throw new ForbiddenException('Only the owner can delete this company');
    }
    await this.companyRepo.delete(id);
  }

  async getMembers(companyId: string, page = 1, limit = 20) {
    const [data, total] = await this.memberRepo.findAndCount({
      where: { companyId },
      relations: ['user'],
      order: { joinedAt: 'ASC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { data, total, page, limit };
  }

  // ──── Invitations ────

  async invite(
    companyId: string,
    invitedByUserId: string,
    dto: InviteMemberDto,
  ): Promise<CompanyInvitation> {
    if (!dto.phone && !dto.email) {
      throw new BadRequestException('Either phone or email is required');
    }
    await this.checkAdminAccess(companyId, invitedByUserId);

    const token = randomUUID();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    const invitation = this.invitationRepo.create({
      companyId,
      invitedByUserId,
      phone: dto.phone ?? null,
      email: dto.email ?? null,
      role: dto.role,
      token,
      expiresAt,
    });

    return this.invitationRepo.save(invitation);
  }

  async acceptInvitation(token: string, userId: string): Promise<Company> {
    const invitation = await this.invitationRepo.findOne({
      where: { token },
      relations: ['company'],
    });
    if (!invitation) {
      throw new NotFoundException('Invitation not found');
    }
    if (invitation.status !== InvitationStatus.PENDING) {
      throw new BadRequestException('Invitation has already been used');
    }
    if (new Date() > invitation.expiresAt) {
      invitation.status = InvitationStatus.EXPIRED;
      await this.invitationRepo.save(invitation);
      throw new BadRequestException('Invitation has expired');
    }

    const existing = await this.memberRepo.findOne({
      where: { companyId: invitation.companyId, userId },
    });
    if (existing) {
      throw new ConflictException('User is already a member of this company');
    }

    const roleMap: Record<string, CompanyRole> = {
      admin: CompanyRole.ADMIN,
      member: CompanyRole.MEMBER,
      guest: CompanyRole.GUEST,
    };

    const member = this.memberRepo.create({
      companyId: invitation.companyId,
      userId,
      role: roleMap[invitation.role] ?? CompanyRole.MEMBER,
      invitedById: invitation.invitedByUserId,
    });
    await this.memberRepo.save(member);

    invitation.status = InvitationStatus.ACCEPTED;
    await this.invitationRepo.save(invitation);

    return invitation.company;
  }

  async declineInvitation(token: string): Promise<void> {
    const invitation = await this.invitationRepo.findOne({
      where: { token },
    });
    if (!invitation) {
      throw new NotFoundException('Invitation not found');
    }
    if (invitation.status !== InvitationStatus.PENDING) {
      throw new BadRequestException('Invitation has already been used');
    }
    invitation.status = InvitationStatus.DECLINED;
    await this.invitationRepo.save(invitation);
  }

  async getInvitations(companyId: string, userId: string) {
    await this.checkAdminAccess(companyId, userId);
    return this.invitationRepo.find({
      where: { companyId, status: InvitationStatus.PENDING },
      relations: ['invitedBy'],
      order: { createdAt: 'DESC' },
    });
  }

  async cancelInvitation(
    companyId: string,
    invitationId: string,
    userId: string,
  ): Promise<void> {
    await this.checkAdminAccess(companyId, userId);
    const invitation = await this.invitationRepo.findOne({
      where: { id: invitationId, companyId },
    });
    if (!invitation) throw new NotFoundException('Invitation not found');
    invitation.status = InvitationStatus.CANCELLED;
    await this.invitationRepo.save(invitation);
  }

  // ──── Member management ────

  async updateMemberRole(
    companyId: string,
    targetUserId: string,
    newRole: CompanyRole,
    currentUserId: string,
  ): Promise<CompanyMember> {
    const currentMember = await this.checkMembership(companyId, currentUserId);
    if (currentMember.role !== CompanyRole.OWNER) {
      throw new ForbiddenException('Only the owner can change member roles');
    }
    if (targetUserId === currentUserId) {
      throw new BadRequestException('Cannot change your own role');
    }

    const target = await this.memberRepo.findOne({
      where: { companyId, userId: targetUserId },
    });
    if (!target) {
      throw new NotFoundException('Member not found');
    }
    if (target.role === CompanyRole.OWNER) {
      throw new ForbiddenException('Cannot change the role of an owner');
    }

    target.role = newRole;
    return this.memberRepo.save(target);
  }

  async removeMember(
    companyId: string,
    targetUserId: string,
    currentUserId: string,
  ): Promise<void> {
    const currentMember = await this.checkAdminAccess(companyId, currentUserId);

    const target = await this.memberRepo.findOne({
      where: { companyId, userId: targetUserId },
    });
    if (!target) {
      throw new NotFoundException('Member not found');
    }
    if (target.role === CompanyRole.OWNER) {
      throw new ForbiddenException('Cannot remove the owner');
    }
    if (
      targetUserId === currentUserId &&
      currentMember.role === CompanyRole.OWNER
    ) {
      throw new BadRequestException('Owner cannot remove themselves');
    }

    await this.memberRepo.remove(target);
  }

  // ──── Helpers ────

  async checkAdminAccessPublic(
    companyId: string,
    userId: string,
  ): Promise<CompanyMember> {
    return this.checkAdminAccess(companyId, userId);
  }

  private async checkMembership(
    companyId: string,
    userId: string,
  ): Promise<CompanyMember> {
    const member = await this.memberRepo.findOne({
      where: { companyId, userId },
    });
    if (!member) {
      throw new ForbiddenException('You are not a member of this company');
    }
    return member;
  }

  private async checkAdminAccess(
    companyId: string,
    userId: string,
  ): Promise<CompanyMember> {
    const member = await this.checkMembership(companyId, userId);
    if (
      member.role !== CompanyRole.OWNER &&
      member.role !== CompanyRole.ADMIN
    ) {
      throw new ForbiddenException(
        'Only admins and owners can perform this action',
      );
    }
    return member;
  }

  private async generateSlug(name: string): Promise<string> {
    const base = name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');

    const exists = await this.companyRepo.findOne({ where: { slug: base } });
    if (!exists) return base;

    const suffix = Math.random().toString(36).substring(2, 6);
    return `${base}-${suffix}`;
  }
}
