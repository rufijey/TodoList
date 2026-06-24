export interface MailTemplateResult {
    subject: string;
    text: string;
    html: string;
}
export declare const getShareNotificationTemplate: (ownerEmail: string, listName: string, permission: "READ" | "WRITE", shareUrl: string) => MailTemplateResult;
export declare const getVerificationEmailTemplate: (verificationUrl: string) => MailTemplateResult;
