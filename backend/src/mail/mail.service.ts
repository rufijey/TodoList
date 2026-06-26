import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import * as dns from 'dns';
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
  private transporter: nodemailer.Transporter | null | undefined = undefined;
  private readonly logger = new Logger(MailService.name);

  constructor(private config: ConfigService) {}

  private async getTransporter(): Promise<nodemailer.Transporter | null> {
    if (this.transporter !== undefined) {
      return this.transporter;
    }

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

      if (host) {
        try {
          const { address } = await dns.promises.lookup(host, { family: 4 });
          options.host = address;
          options.tls = {
            servername: host,
          };
        } catch (err: any) {
          this.logger.warn(`Failed to pre-resolve SMTP host ${host}: ${err.message}`);
        }
      }

      this.transporter = nodemailer.createTransport(options);
      this.logger.log('Nodemailer SMTP transporter initialized');
    } else {
      this.transporter = null;
      this.logger.warn(
        'SMTP credentials not provided. Email service will output emails to console.',
      );
    }

    return this.transporter;
  }

  private async sendEmail(to: string, subject: string, text: string, html: string) {
    const from = this.config.get<string>('SMTP_FROM') || 'noreply@todolist.com';

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

    const transporter = await this.getTransporter();

    if (transporter) {
      try {
        await transporter.sendMail({
          from,
          to,
          subject,
          text,
          html,
        });
        this.logger.log(`Email successfully sent via SMTP to ${to}`);
      } catch (error: any) {
        this.logger.error(`Failed to send email via SMTP to ${to}:`, error);
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
