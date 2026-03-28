import {
  Controller,
  Get,
  Patch,
  Post,
  Param,
  Query,
  Body,
  ParseUUIDPipe,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service.js';
import { UpdateProfileDto } from './dto/update-profile.dto.js';
import { UpdatePrivacyDto } from './dto/update-privacy.dto.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';
import { User } from './entities/user.entity.js';

@ApiTags('users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @ApiOperation({ summary: 'Get current authenticated user' })
  getCurrentUser(@CurrentUser() user: User) {
    return this.usersService.findOne(user.id);
  }

  @Patch('me')
  @ApiOperation({ summary: 'Update current user profile' })
  updateProfile(@CurrentUser() user: User, @Body() dto: UpdateProfileDto) {
    return this.usersService.updateProfile(user.id, dto);
  }

  @Patch('me/privacy')
  @ApiOperation({ summary: 'Update privacy settings' })
  updatePrivacy(@CurrentUser() user: User, @Body() dto: UpdatePrivacyDto) {
    return this.usersService.updatePrivacy(user.id, dto);
  }

  @Post('me/2fa/enable')
  @ApiOperation({ summary: 'Enable two-step verification' })
  setup2fa(@CurrentUser() user: User, @Body('password') password: string) {
    return this.usersService.setup2fa(user.id, password);
  }

  @Post('me/2fa/disable')
  @ApiOperation({ summary: 'Disable two-step verification' })
  disable2fa(@CurrentUser() user: User, @Body('password') password: string) {
    return this.usersService.disable2fa(user.id, password);
  }

  @Get('search')
  @ApiOperation({ summary: 'Search users by username or phone' })
  searchUsers(@Query('q') query: string) {
    return this.usersService.searchUsers(query);
  }

  @Get(':id/presence')
  @ApiOperation({ summary: 'Get user presence / last-seen status' })
  async getPresence(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() viewer: User,
  ) {
    const target = await this.usersService.findOne(id);
    return this.usersService.getPresence(target, viewer.id);
  }
}
