import { Test, TestingModule } from '@nestjs/testing';
import { MailService } from './mail.service';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';

jest.mock('resend');

describe('MailService', () => {
  let service: MailService;
  let configService: ConfigService;

  const mockSend = jest.fn().mockResolvedValue({
    data: { id: 'resend-email-id' },
    error: null,
  });

  const mockConfigService = {
    get: jest.fn().mockImplementation((key: string) => {
      if (key === 'RESEND_API_KEY') return 're_test_key';
      if (key === 'RESEND_FROM') return 'onboarding@resend.dev';
      if (key === 'FRONTEND_URL') return 'http://localhost';
      return null;
    }),
  };

  beforeEach(async () => {
    (Resend as unknown as jest.Mock).mockImplementation(() => {
      return {
        emails: {
          send: mockSend,
        },
      };
    });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MailService,
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<MailService>(MailService);
    configService = module.get<ConfigService>(ConfigService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('sendShareNotification', () => {
    it('should call resend emails.send to dispatch email', async () => {
      await service.sendShareNotification(
        'target@example.com',
        'My List',
        'owner@example.com',
        'WRITE',
        'list-slug',
      );

      expect(mockSend).toHaveBeenCalled();
      const sendArgs = mockSend.mock.calls[0][0];
      expect(sendArgs.to).toBe('target@example.com');
      expect(sendArgs.from).toBe('onboarding@resend.dev');
      expect(sendArgs.subject).toContain('shared a To-Do list with you');
      expect(sendArgs.text).toContain('list-slug');
    });
  });

  describe('sendVerificationEmail', () => {
    it('should call resend emails.send to send verification email', async () => {
      await service.sendVerificationEmail('user@example.com', 'token-123');

      expect(mockSend).toHaveBeenCalled();
      const sendArgs = mockSend.mock.calls[0][0];
      expect(sendArgs.to).toBe('user@example.com');
      expect(sendArgs.from).toBe('onboarding@resend.dev');
      expect(sendArgs.subject).toContain('Verify your To-Do List account');
      expect(sendArgs.text).toContain('token-123');
    });
  });
});
