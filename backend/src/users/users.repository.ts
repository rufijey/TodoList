import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersRepository {
  constructor(private prisma: PrismaService) {}

  async create(email: string, passwordHash: string, verificationToken?: string, isVerified?: boolean) {
    return this.prisma.user.create({
      data: {
        email,
        password: passwordHash,
        verificationToken,
        isVerified: isVerified ?? false,
      },
    });
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  async findByVerificationToken(token: string) {
    return this.prisma.user.findUnique({
      where: { verificationToken: token },
    });
  }

  async verifyUser(userId: string) {
    return this.prisma.user.update({
      where: { id: userId },
      data: {
        isVerified: true,
        verificationToken: null,
      },
    });
  }

  async updateUnverifiedUser(userId: string, passwordHash: string, verificationToken: string) {
    return this.prisma.user.update({
      where: { id: userId },
      data: {
        password: passwordHash,
        verificationToken,
      },
    });
  }

  async findById(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
    });
  }

  async updateRefreshToken(userId: string, refreshTokenHash: string | null) {
    await this.prisma.user.update({
      where: { id: userId },
      data: { refreshToken: refreshTokenHash },
    });
  }

  async clearRefreshToken(userId: string) {
    await this.prisma.user.updateMany({
      where: {
        id: userId,
        refreshToken: {
          not: null,
        },
      },
      data: {
        refreshToken: null,
      },
    });
  }
}
