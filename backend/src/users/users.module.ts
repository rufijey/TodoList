import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { UsersRepository } from './users.repository';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { AtStrategy } from './strategies/at.strategy';
import { RtStrategy } from './strategies/rt.strategy';

@Module({
  imports: [
    JwtModule.register({}),
    ConfigModule,
  ],
  controllers: [UsersController],
  providers: [UsersService, UsersRepository, AtStrategy, RtStrategy],
  exports: [UsersService, UsersRepository],
})
export class UsersModule {}
