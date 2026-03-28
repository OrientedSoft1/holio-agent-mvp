import { Module } from '@nestjs/common';
import { AppGateway } from './gateway.gateway.js';
import { ChatsModule } from '../chats/chats.module.js';
import { MessagesModule } from '../messages/messages.module.js';
import { AuthModule } from '../auth/auth.module.js';
import { UsersModule } from '../users/users.module.js';

@Module({
  imports: [AuthModule, ChatsModule, MessagesModule, UsersModule],
  providers: [AppGateway],
  exports: [AppGateway],
})
export class GatewayModule {}
