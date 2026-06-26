import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { getShareNotificationTemplate, getVerificationEmailTemplate } from './mail.templates';

const cleanLog = (str: string): string => {
  return str
    .split('\n')
    .map((line) => line.trim())
    .join('\n')
    .trim();
};

@Injectable()
export class MailService {
  private transporter!: nodemailer.Transporter | null;
  private readonly logger = new Logger(MailService.name);

  constructor(private config: ConfigService) {
    this.initTransporter();
  }

  private async initTransporter() {
    const host = this.config.get<string>('SMTP_HOST');
    const port = this.config.get<number>('SMTP_PORT') || 587;
    const user = this.config.get<string>('SMTP_USER');
    const pass = this.config.get<string>('SMTP_PASS');

    if (user && pass) {
      const options: any = {
        host,
        port,
        secure: port === 465,
        auth: { user, pass },
      };

      this.transporter = nodemailer.createTransport(options);
      this.logger.log('Nodemailer SMTP transporter initialized');
    } else {
      this.transporter = null;
      this.logger.warn(
        'SMTP credentials not provided. Email service will output emails to console.',
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
    const from = this.config.get<string>('SMTP_FROM') || 'noreply@todolist.com';
    const shareUrl = listSlug ? `${frontendUrl}/lists/${listSlug}` : frontendUrl;

    const { subject, text, html } = getShareNotificationTemplate(
      ownerEmail,
      listName,
      permission,
      shareUrl,
    );

    if (this.transporter) {
      try {
        await this.transporter.sendMail({
          from,
          to: toEmail,
          subject,
          text,
          html,
        });
        this.logger.log(`Email notification successfully sent to ${toEmail}`);
      } catch (error) {
        this.logger.error(`Failed to send email to ${toEmail}:`, error);
      }
    } else {
      this.logger.log(
        cleanLog(`
          [EMAIL OUT]
          ========================================
          TO: ${toEmail}
          FROM: ${from}
          SUBJECT: ${subject}
          BODY:
          ${text}
          ========================================
        `),
      );
    }
  }

  async sendVerificationEmail(toEmail: string, token: string) {
    const frontendUrl = this.config.get<string>('FRONTEND_URL') || 'http://localhost:5173';
    const from = this.config.get<string>('SMTP_FROM') || 'noreply@todolist.com';
    const verificationUrl = `${frontendUrl}/verify-email?token=${token}`;

    const { subject, text, html } = getVerificationEmailTemplate(verificationUrl);

    if (this.transporter) {
      try {
        await this.transporter.sendMail({
          from,
          to: toEmail,
          subject,
          text,
          html,
        });
        this.logger.log(`Verification email successfully sent to ${toEmail}`);
      } catch (error) {
        this.logger.error(`Failed to send verification email to ${toEmail}:`, error);
      }
    } else {
      this.logger.log(
        cleanLog(`
          [EMAIL OUT]
          ========================================
          TO: ${toEmail}
          FROM: ${from}
          SUBJECT: ${subject}
          BODY:
          ${text}
          ========================================
        `),
      );
    }
  }
}
