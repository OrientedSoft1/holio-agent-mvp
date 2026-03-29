import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  ParseUUIDPipe,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ImageGenService } from './image-gen.service.js';
import {
  GenerateImageDto,
  BackgroundRemoveDto,
} from './dto/generate-image.dto.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';

@ApiTags('image-gen')
@UseGuards(JwtAuthGuard)
@Controller('companies/:companyId/image-gen')
export class ImageGenController {
  constructor(private readonly imageGenService: ImageGenService) {}

  @Post('generate')
  @ApiOperation({ summary: 'Generate an image from text' })
  generate(
    @CurrentUser() user: { id: string },
    @Param('companyId', ParseUUIDPipe) companyId: string,
    @Body() dto: GenerateImageDto,
  ) {
    return this.imageGenService.generateImage(companyId, user.id, dto);
  }

  @Post('background-remove')
  @ApiOperation({ summary: 'Remove background from an image' })
  removeBackground(
    @CurrentUser() user: { id: string },
    @Param('companyId', ParseUUIDPipe) companyId: string,
    @Body() dto: BackgroundRemoveDto,
  ) {
    return this.imageGenService.removeBackground(companyId, user.id, dto.image);
  }

  @Get('history')
  @ApiOperation({ summary: 'Get image generation history' })
  history(@Param('companyId', ParseUUIDPipe) companyId: string) {
    return this.imageGenService.getHistory(companyId);
  }
}
