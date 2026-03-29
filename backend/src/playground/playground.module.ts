import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PlaygroundController } from './playground.controller.js';
import { PlaygroundService } from './playground.service.js';
import { PlaygroundPreset } from './entities/playground-preset.entity.js';
import { CompaniesModule } from '../companies/companies.module.js';
import { BotsModule } from '../bots/bots.module.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([PlaygroundPreset]),
    CompaniesModule,
    BotsModule,
  ],
  controllers: [PlaygroundController],
  providers: [PlaygroundService],
})
export class PlaygroundModule {}
