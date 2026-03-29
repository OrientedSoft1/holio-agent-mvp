import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Query,
  Body,
  ParseUUIDPipe,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  UploadedFiles,
  BadRequestException,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { UploadsService } from './uploads.service.js';
import { UploadFileDto } from './dto/upload-file.dto.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';
import { User } from '../users/entities/user.entity.js';

const MAX_FILE_SIZE = 50 * 1024 * 1024;
const ALLOWED_MIME_PREFIXES = [
  'image/',
  'audio/',
  'video/',
  'application/pdf',
  'application/msword',
  'application/vnd.',
  'text/',
];

function fileFilter(
  _req: unknown,
  file: Express.Multer.File,
  cb: (error: Error | null, accept: boolean) => void,
) {
  const allowed = ALLOWED_MIME_PREFIXES.some((prefix) =>
    file.mimetype.startsWith(prefix),
  );
  if (!allowed) {
    cb(
      new BadRequestException(`File type ${file.mimetype} is not allowed`),
      false,
    );
    return;
  }
  cb(null, true);
}

function makeFilename(
  _req: unknown,
  file: Express.Multer.File,
  cb: (err: Error | null, name: string) => void,
) {
  const ext = file.originalname.split('.').pop();
  cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}.${ext}`);
}

@ApiTags('uploads')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('uploads')
export class UploadsController {
  constructor(private readonly uploadsService: UploadsService) {}

  @Post()
  @ApiOperation({ summary: 'Upload a single file' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
        purpose: { type: 'string' },
      },
    },
  })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({ destination: 'uploads', filename: makeFilename }),
      limits: { fileSize: MAX_FILE_SIZE },
      fileFilter,
    }),
  )
  async uploadOne(
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() user: User,
    @Body() dto: UploadFileDto,
  ) {
    if (!file) {
      throw new BadRequestException('No file provided');
    }
    return this.uploadsService.saveRecord(file, user.id, dto.purpose);
  }

  @Post('batch')
  @ApiOperation({ summary: 'Upload multiple files (max 10)' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        files: { type: 'array', items: { type: 'string', format: 'binary' } },
        purpose: { type: 'string' },
      },
    },
  })
  @UseInterceptors(
    FilesInterceptor('files', 10, {
      storage: diskStorage({ destination: 'uploads', filename: makeFilename }),
      limits: { fileSize: MAX_FILE_SIZE },
      fileFilter,
    }),
  )
  async uploadMany(
    @UploadedFiles() files: Express.Multer.File[],
    @CurrentUser() user: User,
    @Body() dto: UploadFileDto,
  ) {
    if (!files?.length) {
      throw new BadRequestException('No files provided');
    }
    return this.uploadsService.saveBatch(files, user.id, dto.purpose);
  }

  @Post('avatar')
  @ApiOperation({ summary: 'Upload a profile avatar image' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
      },
    },
  })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: 'uploads',
        filename: (_req, file, cb) => {
          const ext = file.originalname.split('.').pop();
          cb(
            null,
            `avatar-${Date.now()}-${Math.round(Math.random() * 1e9)}.${ext}`,
          );
        },
      }),
      limits: { fileSize: 5 * 1024 * 1024 },
      fileFilter: (_req, file, cb) => {
        if (!file.mimetype.startsWith('image/')) {
          cb(
            new BadRequestException(
              'Only image files are allowed for avatars',
            ) as unknown as Error,
            false,
          );
          return;
        }
        cb(null, true);
      },
    }),
  )
  async uploadAvatar(
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() user: User,
  ) {
    if (!file) {
      throw new BadRequestException('No file provided');
    }
    return this.uploadsService.saveRecord(file, user.id, 'avatar');
  }

  @Post('company-logo')
  @ApiOperation({ summary: 'Upload a company logo image' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
      },
    },
  })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: 'uploads',
        filename: (_req, file, cb) => {
          const ext = file.originalname.split('.').pop();
          cb(
            null,
            `logo-${Date.now()}-${Math.round(Math.random() * 1e9)}.${ext}`,
          );
        },
      }),
      limits: { fileSize: 2 * 1024 * 1024 },
      fileFilter: (_req, file, cb) => {
        if (
          !file.mimetype.startsWith('image/') &&
          file.mimetype !== 'image/svg+xml'
        ) {
          cb(
            new BadRequestException(
              'Only image files are allowed for company logos',
            ) as unknown as Error,
            false,
          );
          return;
        }
        cb(null, true);
      },
    }),
  )
  async uploadCompanyLogo(
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() user: User,
  ) {
    if (!file) {
      throw new BadRequestException('No file provided');
    }
    return this.uploadsService.saveRecord(file, user.id, 'company-logo');
  }

  @Post('story')
  @ApiOperation({ summary: 'Upload story media (image or video)' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
      },
    },
  })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: 'uploads',
        filename: (_req, file, cb) => {
          const ext = file.originalname.split('.').pop();
          cb(
            null,
            `story-${Date.now()}-${Math.round(Math.random() * 1e9)}.${ext}`,
          );
        },
      }),
      limits: { fileSize: MAX_FILE_SIZE },
      fileFilter: (_req, file, cb) => {
        if (
          !file.mimetype.startsWith('image/') &&
          !file.mimetype.startsWith('video/')
        ) {
          cb(
            new BadRequestException(
              'Only image and video files are allowed for stories',
            ) as unknown as Error,
            false,
          );
          return;
        }
        cb(null, true);
      },
    }),
  )
  async uploadStory(
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() user: User,
  ) {
    if (!file) {
      throw new BadRequestException('No file provided');
    }
    return this.uploadsService.saveRecord(file, user.id, 'story');
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get upload metadata by ID' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.uploadsService.findById(id);
  }

  @Get()
  @ApiOperation({ summary: 'List uploads for the current user' })
  async findMine(
    @CurrentUser() user: User,
    @Query('type') type?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.uploadsService.findByUser(
      user.id,
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 20,
      type,
    );
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete an upload' })
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: User,
  ) {
    await this.uploadsService.remove(user.id, id);
  }
}
