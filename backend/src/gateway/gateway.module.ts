import { Module } from '@nestjs/common';
import { AppGateway } from './gateway.gateway.js';

@Module({
  providers: [AppGateway],
  exports: [AppGateway],
})
export class GatewayModule {}
