import { Test, TestingModule } from '@nestjs/testing';
import { MailService } from './mail.service';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

jest.mock('nodemailer');

describe('MailService', () => {
  let service: MailService;
  let configService: ConfigService;

  const mockSendMail = jest.fn().mockResolvedValue(undefined);
  const mockCreateTransport = jest.fn().mockReturnValue({
    sendMail: mockSendMail,
  });

  const mockConfigService = {
    get: jest.fn().mockImplementation((key: string) => {
      if (key === 'SMTP_HOST') return 'smtp.example.com';
      if (key === 'SMTP_PORT') return 587;
      if (key === 'SMTP_USER') return 'user@example.com';
      if (key === 'SMTP_PASS') return 'password';
      if (key === 'SMTP_FROM') return 'noreply@example.com';
      if (key === 'FRONTEND_URL') return 'http://localhost';
      return null;
    }),
  };

  beforeEach(async () => {
    (nodemailer.createTransport as jest.Mock).mockImplementation(mockCreateTransport);

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
    it('should call sendMail when transporter is initialized', async () => {
      await service.sendShareNotification(
        'target@example.com',
        'My List',
        'owner@example.com',
        'WRITE',
        'list-slug',
      );

      expect(mockSendMail).toHaveBeenCalled();
      const mailOptions = mockSendMail.mock.calls[0][0];
      expect(mailOptions.to).toBe('target@example.com');
      expect(mailOptions.subject).toContain('shared a To-Do list with you');
      expect(mailOptions.text).toContain('list-slug');
    });
  });

  describe('sendVerificationEmail', () => {
    it('should call sendMail for account verification', async () => {
      await service.sendVerificationEmail('user@example.com', 'token-123');

      expect(mockSendMail).toHaveBeenCalled();
      const mailOptions = mockSendMail.mock.calls[0][0];
      expect(mailOptions.to).toBe('user@example.com');
      expect(mailOptions.subject).toContain('Verify your To-Do List account');
      expect(mailOptions.text).toContain('token-123');
    });
  });
});
