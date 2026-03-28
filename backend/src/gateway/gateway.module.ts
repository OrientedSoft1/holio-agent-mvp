import { Module } from '@nestjs/common';
import { AppGateway } from './gateway.gateway.js';
import { ChatsModule } from '../chats/chats.module.js';
import { MessagesModule } from '../messages/messages.module.js';
import { AuthModule } from '../auth/auth.module.js';
import { UsersModule } from '../users/users.module.js';
import { BotsModule } from '../bots/bots.module.js';
import { BotWorkerModule } from '../bot-worker/bot-worker.module.js';

@Module({
  imports: [
    AuthModule,
    ChatsModule,
    MessagesModule,
    UsersModule,
    BotsModule,
    BotWorkerModule,
  ],
  providers: [AppGateway],
  exports: [AppGateway],
})
export class GatewayModule {}
