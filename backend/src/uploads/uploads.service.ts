import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Upload } from './entities/upload.entity.js';
import { join } from 'path';
import { existsSync, mkdirSync } from 'fs';

const UPLOAD_DIR = join(process.cwd(), 'uploads');

@Injectable()
export class UploadsService {
  constructor(
    @InjectRepository(Upload)
    private readonly uploadRepo: Repository<Upload>,
  ) {
    if (!existsSync(UPLOAD_DIR)) {
      mkdirSync(UPLOAD_DIR, { recursive: true });
    }
  }

  getUploadDir(): string {
    return UPLOAD_DIR;
  }

  async saveRecord(
    file: Express.Multer.File,
    uploaderId: string,
    purpose?: string,
  ): Promise<Upload> {
    const upload = this.uploadRepo.create({
      uploaderId,
      originalName: file.originalname,
      storedName: file.filename,
      mimeType: file.mimetype,
      size: file.size,
      url: `/uploads/${file.filename}`,
      purpose: purpose ?? null,
    });

    return this.uploadRepo.save(upload);
  }

  async saveBatch(
    files: Express.Multer.File[],
    uploaderId: string,
    purpose?: string,
  ): Promise<Upload[]> {
    const uploads = files.map((file) =>
      this.uploadRepo.create({
        uploaderId,
        originalName: file.originalname,
        storedName: file.filename,
        mimeType: file.mimetype,
        size: file.size,
        url: `/uploads/${file.filename}`,
        purpose: purpose ?? null,
      }),
    );

    return this.uploadRepo.save(uploads);
  }

  async findById(id: string): Promise<Upload> {
    const upload = await this.uploadRepo.findOne({ where: { id } });
    if (!upload) {
      throw new NotFoundException('Upload not found');
    }
    return upload;
  }

  async findByUser(
    uploaderId: string,
    page = 1,
    limit = 20,
  ): Promise<{ data: Upload[]; total: number; page: number; limit: number }> {
    const [data, total] = await this.uploadRepo.findAndCount({
      where: { uploaderId },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { data, total, page, limit };
  }
}
