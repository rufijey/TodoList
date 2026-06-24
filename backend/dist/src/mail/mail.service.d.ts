import { ConfigService } from '@nestjs/config';
export declare class MailService {
    private config;
    private transporter;
    private readonly logger;
    constructor(config: ConfigService);
    private initTransporter;
    sendShareNotification(toEmail: string, listName: string, ownerEmail: string, permission: 'READ' | 'WRITE', listSlug?: string): Promise<void>;
    sendVerificationEmail(toEmail: string, token: string): Promise<void>;
}
