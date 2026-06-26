import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { getShareNotificationTemplate, getVerificationEmailTemplate } from './mail.templates';

const cleanLog = (str: string): string => {
  return str
    .split('\n')
    .map((line) => line.trim())
    .join('\n')
    .trim();
};

const extractEmail = (emailStr: string): string => {
  const match = emailStr.match(/<([^>]+)>/);
  return match ? match[1] : emailStr.trim();
};

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);

  constructor(private config: ConfigService) {}

  private async sendEmail(to: string, subject: string, text: string, html: string) {
    const apiKey = this.config.get<string>('SENDGRID_API_KEY');
    const rawFrom = this.config.get<string>('SENDGRID_FROM') || this.config.get<string>('SMTP_FROM') || 'tikhonov.alexander.work@gmail.com';
    const fromEmail = extractEmail(rawFrom);

    this.logger.log(
      cleanLog(`
        [EMAIL OUT]
        ========================================
        TO: ${to}
        FROM: ${fromEmail}
        SUBJECT: ${subject}
        BODY:
        ${text}
        ========================================
      `),
    );

    if (apiKey) {
      try {
        const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            personalizations: [
              {
                to: [{ email: to }],
              },
            ],
            from: {
              email: fromEmail,
              name: 'To-Do List Team',
            },
            subject: subject,
            content: [
              {
                type: 'text/plain',
                value: text,
              },
              {
                type: 'text/html',
                value: html,
              },
            ],
          }),
        });

        if (!response.ok) {
          const errText = await response.text();
          throw new Error(`SendGrid API error: ${response.status} ${response.statusText} - ${errText}`);
        }

        this.logger.log(`Email successfully sent via SendGrid to ${to}`);
      } catch (error: any) {
        this.logger.error(`Failed to send email via SendGrid to ${to}:`, error.message || error);
      }
    }
  }

  private getFrontendUrl(): string {
    const rawUrl = this.config.get<string>('FRONTEND_URL') || 'http://localhost:5173';
    try {
      return new URL(rawUrl).origin;
    } catch {
      return rawUrl;
    }
  }

  async sendShareNotification(
    toEmail: string,
    listName: string,
    ownerEmail: string,
    permission: 'READ' | 'WRITE',
    listSlug?: string,
  ) {
    const frontendUrl = this.getFrontendUrl();
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
    const frontendUrl = this.getFrontendUrl();
    const verificationUrl = `${frontendUrl}/verify-email?token=${token}`;

    const { subject, text, html } = getVerificationEmailTemplate(verificationUrl);

    await this.sendEmail(toEmail, subject, text, html);
  }
}
