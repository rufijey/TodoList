import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { getShareNotificationTemplate, getVerificationEmailTemplate } from './mail.templates';
import { Resend } from 'resend';

const cleanLog = (str: string): string => {
  return str
    .split('\n')
    .map((line) => line.trim())
    .join('\n')
    .trim();
};

@Injectable()
export class MailService {
  private resend: Resend | null = null;
  private readonly logger = new Logger(MailService.name);

  constructor(private config: ConfigService) {
    const apiKey = this.config.get<string>('RESEND_API_KEY');
    if (apiKey) {
      this.resend = new Resend(apiKey);
      this.logger.log('Resend client initialized');
    } else {
      this.logger.warn('RESEND_API_KEY not provided. Email service will output emails to console.');
    }
  }

  private async sendEmail(to: string, subject: string, text: string, html: string) {
    let from = this.config.get<string>('RESEND_FROM') || this.config.get<string>('SMTP_FROM') || 'onboarding@resend.dev';
    if (from.includes('todolist.com')) {
      from = 'onboarding@resend.dev';
    }

    if (this.resend) {
      try {
        const { data, error } = await this.resend.emails.send({
          from,
          to,
          subject,
          text,
          html,
        });

        if (error) {
          throw new Error(error.message || JSON.stringify(error));
        }

        this.logger.log(`Email successfully sent via Resend to ${to} (ID: ${data?.id})`);
      } catch (error: any) {
        this.logger.error(`Failed to send email via Resend to ${to}:`, error.message);
      }
    } else {
      this.logger.log(
        cleanLog(`
          [EMAIL OUT]
          ========================================
          TO: ${to}
          FROM: ${from}
          SUBJECT: ${subject}
          BODY:
          ${text}
          ========================================
        `),
      );
    }
  }

  async sendShareNotification(
    toEmail: string,
    listName: string,
    ownerEmail: string,
    permission: 'READ' | 'WRITE',
    listSlug?: string,
  ) {
    const frontendUrl = this.config.get<string>('FRONTEND_URL') || 'http://localhost:5173';
    const shareUrl = listSlug ? `${frontendUrl}/lists/${listSlug}` : frontendUrl;

    const { subject, text, html } = getShareNotificationTemplate(
      ownerEmail,
      listName,
      permission,
      shareUrl,
    );

    await this.sendEmail(toEmail, subject, text, html);
  }

  async sendVerificationEmail(toEmail: string, token: string) {
    const frontendUrl = this.config.get<string>('FRONTEND_URL') || 'http://localhost:5173';
    const verificationUrl = `${frontendUrl}/verify-email?token=${token}`;

    const { subject, text, html } = getVerificationEmailTemplate(verificationUrl);

    await this.sendEmail(toEmail, subject, text, html);
  }
}
