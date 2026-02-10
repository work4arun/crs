import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Role } from '@prisma/client';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey:
        process.env.JWT_SECRET || 'supersecretkeyshouldbechangedinproduction',
    });
  }

  async validate(payload: {
    sub: string;
    email: string;
    role: Role;
    sid: string;
  }) {
    // Check if session exists and is valid
    const session = await this.prisma.session.findUnique({
      where: { token: payload.sid },
    });

    if (!session || session.expiresAt < new Date()) {
      return null; // Token rejected
    }

    return {
      userId: payload.sub,
      email: payload.email,
      role: payload.role,
      sessionId: payload.sid,
    };
  }
}
