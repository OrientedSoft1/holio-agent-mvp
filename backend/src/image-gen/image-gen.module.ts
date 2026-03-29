import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ImageGenController } from './image-gen.controller.js';
import { ImageGenService } from './image-gen.service.js';
import { ImageGeneration } from './entities/image-generation.entity.js';
import { CompaniesModule } from '../companies/companies.module.js';
import { BotsModule } from '../bots/bots.module.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([ImageGeneration]),
    CompaniesModule,
    BotsModule,
  ],
  controllers: [ImageGenController],
  providers: [ImageGenService],
})
export class ImageGenModule {}
