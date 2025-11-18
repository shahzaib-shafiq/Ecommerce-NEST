import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_SECRET || 'defaultSecretKey',
      ignoreExpiration: false,
    });
  }

  // payload = { sub: userId, role: 'ADMIN' }
  async validate(payload: any) {
    return {
      userId: payload.sub,
      role: payload.role,
    };
  }
}
