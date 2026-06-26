export interface MailTemplateResult {
  subject: string;
  text: string;
  html: string;
}

const clean = (str: string): string => {
  return str
    .split('\n')
    .map((line) => line.trim())
    .join('\n')
    .trim();
};

export const getShareNotificationTemplate = (
  ownerEmail: string,
  listName: string,
  permission: 'READ' | 'WRITE',
  shareUrl: string,
): MailTemplateResult => {
  const subject = `${ownerEmail} shared a To-Do list with you`;
  const permissionText = permission === 'WRITE' ? 'Edit (WRITE)' : 'Read-Only (READ)';

  const text = clean(`
    Hello!

    User ${ownerEmail} has shared their To-Do list "${listName}" with you.
    Access Permission: ${permissionText}.

    You can view it here: ${shareUrl}

    Best regards,
    To-Do List Team
  `);

  const html = clean(`
    <div style="font-family: Arial, sans-serif; padding: 20px; color: #333; max-width: 600px; border: 1px solid #eee; border-radius: 8px;">
      <h2 style="color: #4F46E5;">Shared To-Do List</h2>
      <p>Hello!</p>
      <p>User <strong>${ownerEmail}</strong> has shared their To-Do list <strong>"${listName}"</strong> with you.</p>
      <p><strong>Access Permission:</strong> ${permissionText}.</p>
      <p>Click the link below to sign in and start working:</p>
      <p style="margin: 25px 0;"><a href="${shareUrl}" style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">Go to To-Do List</a></p>
      <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
      <p style="font-size: 12px; color: #777;">This is an automated notification. Please do not reply to this email.</p>
    </div>
  `);

  return { subject, text, html };
};

export const getVerificationEmailTemplate = (
  verificationUrl: string,
): MailTemplateResult => {
  const subject = 'Verify your To-Do List account';

  const text = clean(`
    Hello!

    Thank you for registering on To-Do List.
    Please verify your email address by clicking the link below:

    ${verificationUrl}

    If you did not request this registration, please ignore this email.

    Best regards,
    To-Do List Team
  `);

  const html = clean(`
    <div style="font-family: Arial, sans-serif; padding: 20px; color: #333; max-width: 600px; border: 1px solid #eee; border-radius: 8px;">
      <h2 style="color: #4F46E5;">Email Verification</h2>
      <p>Hello!</p>
      <p>Thank you for registering on <strong>To-Do List</strong>.</p>
      <p>Please verify your email address by clicking the button below:</p>
      <p style="margin: 25px 0;"><a href="${verificationUrl}" style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">Verify Email Address</a></p>
      <p style="font-size: 13px; color: #555;">Or copy and paste this URL into your browser:</p>
      <p style="font-size: 13px; color: #4F46E5;"><a href="${verificationUrl}">${verificationUrl}</a></p>
      <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
      <p style="font-size: 12px; color: #777;">If you did not create an account, no further action is required.</p>
      <p style="font-size: 11px; color: #999; margin-top: 10px;">Note: If this email ended up in your Spam or Junk folder, please mark it as "Not Spam" to receive future notifications normally.</p>
    </div>
  `);

  return { subject, text, html };
};
