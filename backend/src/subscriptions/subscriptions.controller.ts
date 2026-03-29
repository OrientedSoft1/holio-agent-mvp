import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';
import { User } from '../users/entities/user.entity.js';
import { SubscriptionsService } from './subscriptions.service.js';

@ApiTags('subscriptions')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('subscriptions')
export class SubscriptionsController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  @Get('plans')
  @ApiOperation({ summary: 'List available subscription plans' })
  getPlans() {
    return this.subscriptionsService.getPlans();
  }

  @Get('me')
  @ApiOperation({ summary: 'Get current user subscription' })
  getSubscription(@CurrentUser() user: User) {
    return this.subscriptionsService.findByUser(user.id);
  }

  @Post()
  @ApiOperation({ summary: 'Subscribe to a plan' })
  subscribe(@CurrentUser() user: User, @Body('planId') planId: string) {
    return this.subscriptionsService.subscribe(user.id, planId);
  }

  @Post('cancel')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Cancel subscription' })
  cancel(@CurrentUser() user: User) {
    return this.subscriptionsService.cancel(user.id);
  }
}
