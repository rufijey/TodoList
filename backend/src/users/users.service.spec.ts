import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { UsersRepository } from './users.repository';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { MailService } from '../mail/mail.service';
import { ConflictException, ForbiddenException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';

describe('UsersService', () => {
  let service: UsersService;
  let repository: UsersRepository;

  const mockUser = {
    id: 'user-uuid',
    email: 'test@example.com',
    password: 'hashedpassword',
    refreshToken: 'hashedrefreshtoken',
    isVerified: true,
    verificationToken: null,
    createdAt: new Date(),
  };

  const mockUsersRepository = {
    create: jest.fn(),
    findByEmail: jest.fn(),
    findById: jest.fn(),
    updateRefreshToken: jest.fn(),
    clearRefreshToken: jest.fn(),
    findByVerificationToken: jest.fn(),
    verifyUser: jest.fn(),
    updateUnverifiedUser: jest.fn(),
  };

  const mockJwtService = {
    signAsync: jest.fn().mockImplementation((payload, options: any) => {
      if (options.secret.includes('access')) return Promise.resolve('mock_access_token');
      return Promise.resolve('mock_refresh_token');
    }),
  };

  const mockConfigService = {
    get: jest.fn().mockImplementation((key: string) => {
      if (key === 'JWT_ACCESS_SECRET') return 'access_secret';
      if (key === 'JWT_REFRESH_SECRET') return 'refresh_secret';
      return null;
    }),
  };

  const mockMailService = {
    sendVerificationEmail: jest.fn().mockResolvedValue(undefined),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: UsersRepository, useValue: mockUsersRepository },
        { provide: JwtService, useValue: mockJwtService },
        { provide: ConfigService, useValue: mockConfigService },
        { provide: MailService, useValue: mockMailService },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    repository = module.get<UsersRepository>(UsersRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('signup', () => {
    it('should successfully create a new user and send verification email', async () => {
      mockUsersRepository.findByEmail.mockResolvedValue(null);
      mockUsersRepository.create.mockResolvedValue(mockUser);
      jest.spyOn(bcrypt, 'hash').mockImplementation(() => Promise.resolve('hashedpassword'));

      const result = await service.signup({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(mockUsersRepository.findByEmail).toHaveBeenCalledWith('test@example.com');
      expect(mockUsersRepository.create).toHaveBeenCalled();
      expect(mockMailService.sendVerificationEmail).toHaveBeenCalled();
      expect(result).toHaveProperty('message');
      expect(result.message).toContain('Verification email sent');
    });

    it('should throw ConflictException if email is already taken by a verified user', async () => {
      mockUsersRepository.findByEmail.mockResolvedValue(mockUser);

      await expect(
        service.signup({
          email: 'test@example.com',
          password: 'password123',
        }),
      ).rejects.toThrow(ConflictException);
    });

    it('should update unverified user and resend verification email if email is taken by an unverified user', async () => {
      const unverifiedMockUser = { ...mockUser, isVerified: false };
      mockUsersRepository.findByEmail.mockResolvedValue(unverifiedMockUser);
      mockUsersRepository.updateUnverifiedUser.mockResolvedValue(unverifiedMockUser);
      jest.spyOn(bcrypt, 'hash').mockImplementation(() => Promise.resolve('hashedpassword'));

      const result = await service.signup({
        email: 'test@example.com',
        password: 'newpassword123',
      });

      expect(mockUsersRepository.findByEmail).toHaveBeenCalledWith('test@example.com');
      expect(mockUsersRepository.updateUnverifiedUser).toHaveBeenCalled();
      expect(mockMailService.sendVerificationEmail).toHaveBeenCalled();
      expect(result).toHaveProperty('message');
      expect(result.message).toContain('Verification email sent');
    });
  });

  describe('signin', () => {
    it('should authenticate verified user and return tokens', async () => {
      mockUsersRepository.findByEmail.mockResolvedValue(mockUser);
      mockUsersRepository.updateRefreshToken.mockResolvedValue(undefined);
      jest.spyOn(bcrypt, 'compare').mockImplementation(() => Promise.resolve(true));
      jest.spyOn(bcrypt, 'hash').mockImplementation(() => Promise.resolve('new_hashed_rt'));

      const result = await service.signin({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(result).toHaveProperty('accessToken');
      expect(result.accessToken).toBe('mock_access_token');
    });

    it('should throw ForbiddenException if user is not verified', async () => {
      const unverifiedMockUser = { ...mockUser, isVerified: false };
      mockUsersRepository.findByEmail.mockResolvedValue(unverifiedMockUser);

      await expect(
        service.signin({
          email: 'test@example.com',
          password: 'password123',
        }),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw ForbiddenException if user not found', async () => {
      mockUsersRepository.findByEmail.mockResolvedValue(null);

      await expect(
        service.signin({
          email: 'nonexistent@example.com',
          password: 'password123',
        }),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw ForbiddenException for invalid password', async () => {
      mockUsersRepository.findByEmail.mockResolvedValue(mockUser);
      jest.spyOn(bcrypt, 'compare').mockImplementation(() => Promise.resolve(false));

      await expect(
        service.signin({
          email: 'test@example.com',
          password: 'wrongpassword',
        }),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('logout', () => {
    it('should clear refresh token', async () => {
      mockUsersRepository.clearRefreshToken.mockResolvedValue(undefined);

      await service.logout('user-uuid');

      expect(mockUsersRepository.clearRefreshToken).toHaveBeenCalledWith('user-uuid');
    });
  });
});
