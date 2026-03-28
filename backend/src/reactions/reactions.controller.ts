import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ReactionsService } from './reactions.service.js';

@ApiTags('reactions')
@Controller('reactions')
export class ReactionsController {
  constructor(private readonly reactionsService: ReactionsService) {}
}
