import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { BotsService } from './bots.service.js';

@ApiTags('bots')
@Controller('bots')
export class BotsController {
  constructor(private readonly botsService: BotsService) {}
}
