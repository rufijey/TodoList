import { ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { UsersRepository } from './users.repository';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { MailService } from '../mail/mail.service';
import * as crypto from 'crypto';

@Injectable()
export class UsersService {
  constructor(
    private usersRepository: UsersRepository,
    private jwtService: JwtService,
    private config: ConfigService,
    private mailService: MailService,
  ) {}

  async signup(createUserDto: CreateUserDto) {
    const existingUser = await this.usersRepository.findByEmail(createUserDto.email);

    if (existingUser) {
      if (existingUser.isVerified) {
        throw new ConflictException('User with this email already exists');
      }

      const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
      const token = crypto.randomUUID();
      await this.usersRepository.updateUnverifiedUser(existingUser.id, hashedPassword, token);

      this.mailService.sendVerificationEmail(existingUser.email, token);

      return {
        message: 'Verification email sent. Please check your mailbox.',
      };
    }

    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    const token = crypto.randomUUID();
    const user = await this.usersRepository.create(createUserDto.email, hashedPassword, token, false);

    this.mailService.sendVerificationEmail(user.email, token);

    return {
      message: 'Verification email sent. Please check your mailbox.',
    };
  }

  async signin(loginUserDto: LoginUserDto) {
    const user = await this.usersRepository.findByEmail(loginUserDto.email);

    if (!user) {
      throw new ForbiddenException('Invalid email or password');
    }

    if (!user.isVerified) {
      throw new ForbiddenException('Please verify your email address before logging in');
    }

    const passwordMatches = await bcrypt.compare(loginUserDto.password, user.password);
    if (!passwordMatches) {
      throw new ForbiddenException('Invalid email or password');
    }

    const tokens = await this.getTokens(user.id, user.email);
    await this.updateRefreshToken(user.id, tokens.refreshToken);
    return {
      user: {
        id: user.id,
        email: user.email,
      },
      ...tokens,
    };
  }

  async verifyEmail(token: string) {
    const user = await this.usersRepository.findByVerificationToken(token);

    if (!user) {
      throw new ForbiddenException('Invalid or expired verification token');
    }

    await this.usersRepository.verifyUser(user.id);
    return {
      message: 'Email verified successfully',
    };
  }

  async logout(userId: string) {
    await this.usersRepository.clearRefreshToken(userId);
  }

  async refreshTokens(userId: string, rt: string) {
    const user = await this.usersRepository.findById(userId);

    if (!user || !user.refreshToken) {
      throw new ForbiddenException('Access denied (user not authenticated or token invalid)');
    }

    const rtMatches = await bcrypt.compare(rt, user.refreshToken);
    if (!rtMatches) {
      throw new ForbiddenException('Access denied (invalid refresh token)');
    }

    const tokens = await this.getTokens(user.id, user.email);
    await this.updateRefreshToken(user.id, tokens.refreshToken);
    return tokens;
  }

  async findByEmail(email: string) {
    const user = await this.usersRepository.findByEmail(email);
    if (!user) return null;
    return {
      id: user.id,
      email: user.email,
    };
  }

  async findById(id: string) {
    const user = await this.usersRepository.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return {
      id: user.id,
      email: user.email,
    };
  }

  private async updateRefreshToken(userId: string, refreshToken: string) {
    const hashedToken = await bcrypt.hash(refreshToken, 10);
    await this.usersRepository.updateRefreshToken(userId, hashedToken);
  }

  private async getTokens(userId: string, email: string) {
    const [at, rt] = await Promise.all([
      this.jwtService.signAsync(
        {
          userId,
          email,
        },
        {
          secret: this.config.get<string>('JWT_ACCESS_SECRET') || 'myaccesssecret_super_secret_key_123',
          expiresIn: '15m',
        },
      ),
      this.jwtService.signAsync(
        {
          userId,
          email,
        },
        {
          secret: this.config.get<string>('JWT_REFRESH_SECRET') || 'myrefreshsecret_super_secret_key_456',
          expiresIn: '7d',
        },
      ),
    ]);

    return {
      accessToken: at,
      refreshToken: rt,
    };
  }
}
