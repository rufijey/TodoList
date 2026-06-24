"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var MailService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MailService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const nodemailer = require("nodemailer");
const mail_templates_1 = require("./mail.templates");
const cleanLog = (str) => {
    return str
        .split('\n')
        .map((line) => line.trim())
        .join('\n')
        .trim();
};
let MailService = MailService_1 = class MailService {
    config;
    transporter;
    logger = new common_1.Logger(MailService_1.name);
    constructor(config) {
        this.config = config;
        this.initTransporter();
    }
    async initTransporter() {
        const host = this.config.get('SMTP_HOST');
        const port = this.config.get('SMTP_PORT') || 587;
        const user = this.config.get('SMTP_USER');
        const pass = this.config.get('SMTP_PASS');
        if (user && pass) {
            const options = {
                host,
                port,
                secure: port === 465,
                auth: { user, pass },
            };
            if (host && host.includes('gmail.com')) {
                options.service = 'gmail';
                delete options.host;
                delete options.port;
                delete options.secure;
            }
            this.transporter = nodemailer.createTransport(options);
            this.logger.log('Nodemailer SMTP transporter initialized');
        }
        else {
            this.transporter = null;
            this.logger.warn('SMTP credentials not provided. Email service will output emails to console.');
        }
    }
    async sendShareNotification(toEmail, listName, ownerEmail, permission, listSlug) {
        const frontendUrl = this.config.get('FRONTEND_URL') || 'http://localhost:5173';
        const from = this.config.get('SMTP_FROM') || 'noreply@todolist.com';
        const shareUrl = listSlug ? `${frontendUrl}/lists/${listSlug}` : frontendUrl;
        const { subject, text, html } = (0, mail_templates_1.getShareNotificationTemplate)(ownerEmail, listName, permission, shareUrl);
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
            }
            catch (error) {
                this.logger.error(`Failed to send email to ${toEmail}:`, error);
            }
        }
        else {
            this.logger.log(cleanLog(`
          [EMAIL OUT]
          ========================================
          TO: ${toEmail}
          FROM: ${from}
          SUBJECT: ${subject}
          BODY:
          ${text}
          ========================================
        `));
        }
    }
    async sendVerificationEmail(toEmail, token) {
        const frontendUrl = this.config.get('FRONTEND_URL') || 'http://localhost:5173';
        const from = this.config.get('SMTP_FROM') || 'noreply@todolist.com';
        const verificationUrl = `${frontendUrl}/verify-email?token=${token}`;
        const { subject, text, html } = (0, mail_templates_1.getVerificationEmailTemplate)(verificationUrl);
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
            }
            catch (error) {
                this.logger.error(`Failed to send verification email to ${toEmail}:`, error);
            }
        }
        else {
            this.logger.log(cleanLog(`
          [EMAIL OUT]
          ========================================
          TO: ${toEmail}
          FROM: ${from}
          SUBJECT: ${subject}
          BODY:
          ${text}
          ========================================
        `));
        }
    }
};
exports.MailService = MailService;
exports.MailService = MailService = MailService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], MailService);
//# sourceMappingURL=mail.service.js.map