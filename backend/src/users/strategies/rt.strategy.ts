import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class RtStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  constructor(config: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: config.get<string>('JWT_REFRESH_SECRET') || 'myrefreshsecret_super_secret_key_456',
      passReqToCallback: true,
    });
  }

  validate(req: Request, payload: any) {
    if (!payload || !payload.userId) {
      throw new UnauthorizedException('Invalid token payload');
    }
    const refreshToken = req.get('authorization')?.replace('Bearer', '').trim();
    return {
      userId: payload.userId,
      email: payload.email,
      refreshToken,
    };
  }
}
