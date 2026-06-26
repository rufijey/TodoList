import { Test, TestingModule } from '@nestjs/testing';
import { MailService } from './mail.service';
import { ConfigService } from '@nestjs/config';

describe('MailService', () => {
  let service: MailService;
  let configService: ConfigService;

  const mockFetch = jest.fn().mockResolvedValue({
    ok: true,
    text: async () => '',
  });

  const mockConfigService = {
    get: jest.fn().mockImplementation((key: string) => {
      if (key === 'SENDGRID_API_KEY') return 'SG.test_key';
      if (key === 'SENDGRID_FROM') return 'sender@example.com';
      if (key === 'FRONTEND_URL') return 'http://localhost';
      return null;
    }),
  };

  beforeEach(async () => {
    global.fetch = mockFetch;

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
    it('should call fetch to SendGrid API', async () => {
      await service.sendShareNotification(
        'target@example.com',
        'My List',
        'owner@example.com',
        'WRITE',
        'list-slug',
      );

      expect(mockFetch).toHaveBeenCalled();
      const fetchArgs = mockFetch.mock.calls[0];
      expect(fetchArgs[0]).toBe('https://api.sendgrid.com/v3/mail/send');
      const fetchOptions = fetchArgs[1];
      expect(fetchOptions.method).toBe('POST');
      expect(fetchOptions.headers.Authorization).toBe('Bearer SG.test_key');
      const body = JSON.parse(fetchOptions.body);
      expect(body.personalizations[0].to[0].email).toBe('target@example.com');
      expect(body.subject).toContain('shared a To-Do list with you');
      expect(body.content[0].value).toContain('list-slug');
    });
  });

  describe('sendVerificationEmail', () => {
    it('should call fetch to SendGrid API', async () => {
      await service.sendVerificationEmail('user@example.com', 'token-123');

      expect(mockFetch).toHaveBeenCalled();
      const fetchArgs = mockFetch.mock.calls[0];
      expect(fetchArgs[0]).toBe('https://api.sendgrid.com/v3/mail/send');
      const fetchOptions = fetchArgs[1];
      expect(fetchOptions.method).toBe('POST');
      expect(fetchOptions.headers.Authorization).toBe('Bearer SG.test_key');
      const body = JSON.parse(fetchOptions.body);
      expect(body.personalizations[0].to[0].email).toBe('user@example.com');
      expect(body.subject).toContain('Verify your To-Do List account');
      expect(body.content[0].value).toContain('token-123');
    });
  });
});
