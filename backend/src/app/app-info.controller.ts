import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Public } from '../common/decorators/public.decorator.js';
import { readFileSync } from 'fs';
import { join } from 'path';

const pkg = JSON.parse(
  readFileSync(join(process.cwd(), 'package.json'), 'utf-8'),
) as { version?: string };

@ApiTags('app')
@Controller('app')
export class AppInfoController {
  @Public()
  @Get('check-update')
  @ApiOperation({ summary: 'Check for app updates' })
  checkUpdate(@Query('currentVersion') currentVersion?: string) {
    const latestVersion = pkg.version ?? '1.0.0';
    const hasUpdate = currentVersion ? currentVersion !== latestVersion : false;
    return { hasUpdate, latestVersion };
  }
}
