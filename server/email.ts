import nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';

// Email configuration from environment variables
const EMAIL_HOST = process.env.EMAIL_HOST || 'smtp.gmail.com';
const EMAIL_PORT = parseInt(process.env.EMAIL_PORT || '587');
const EMAIL_SECURE = process.env.EMAIL_SECURE === 'true';
const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASS = process.env.EMAIL_PASS;
const EMAIL_FROM = process.env.EMAIL_FROM || 'noreply@taptopload.com';

// Create reusable transporter
let transporter: Transporter | null = null;

function createTransporter(): Transporter | null {
  if (!EMAIL_USER || !EMAIL_PASS) {
    console.warn('Email credentials not configured. Email functionality will be disabled.');
    return null;
  }

  return nodemailer.createTransport({
    host: EMAIL_HOST,
    port: EMAIL_PORT,
    secure: EMAIL_SECURE,
    auth: {
      user: EMAIL_USER,
      pass: EMAIL_PASS,
    },
  });
}

// Initialize transporter
export function initEmailService() {
  transporter = createTransporter();
  return transporter !== null;
}

// Send password reset email
export async function sendPasswordResetEmail(
  email: string,
  resetToken: string,
  firstName?: string
): Promise<boolean> {
  if (!transporter) {
    console.error('Email service not initialized. Cannot send password reset email.');
    return false;
  }

  try {
    const resetUrl = `${process.env.REPLIT_DEV_DOMAIN ? `https://${process.env.REPLIT_DEV_DOMAIN}` : 'http://localhost:5000'}/reset-password?token=${resetToken}`;
    
    const mailOptions = {
      from: `"TapTopLoad" <${EMAIL_FROM}>`,
      to: email,
      subject: 'Réinitialisation de votre mot de passe - TapTopLoad',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .header {
              background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
              color: white;
              padding: 30px;
              text-align: center;
              border-radius: 10px 10px 0 0;
            }
            .content {
              background: #f9fafb;
              padding: 30px;
              border-radius: 0 0 10px 10px;
            }
            .button {
              display: inline-block;
              background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
              color: white;
              padding: 15px 30px;
              text-decoration: none;
              border-radius: 8px;
              margin: 20px 0;
              font-weight: bold;
            }
            .footer {
              text-align: center;
              margin-top: 30px;
              padding-top: 20px;
              border-top: 1px solid #e5e7eb;
              color: #6b7280;
              font-size: 14px;
            }
            .warning {
              background: #fef3c7;
              border-left: 4px solid #f59e0b;
              padding: 15px;
              margin: 20px 0;
              border-radius: 4px;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>⚡ TapTopLoad</h1>
          </div>
          <div class="content">
            <h2>Bonjour${firstName ? ' ' + firstName : ''},</h2>
            <p>Nous avons reçu une demande de réinitialisation de mot de passe pour votre compte TapTopLoad.</p>
            <p>Cliquez sur le bouton ci-dessous pour réinitialiser votre mot de passe :</p>
            <div style="text-align: center;">
              <a href="${resetUrl}" class="button">Réinitialiser mon mot de passe</a>
            </div>
            <p>Ou copiez et collez ce lien dans votre navigateur :</p>
            <p style="background: white; padding: 10px; border-radius: 4px; word-break: break-all;">
              ${resetUrl}
            </p>
            <div class="warning">
              <strong>⚠️ Important :</strong>
              <ul style="margin: 10px 0;">
                <li>Ce lien est valide pendant 1 heure</li>
                <li>Si vous n'avez pas demandé cette réinitialisation, ignorez cet email</li>
                <li>Votre mot de passe actuel reste inchangé jusqu'à ce que vous en créiez un nouveau</li>
              </ul>
            </div>
          </div>
          <div class="footer">
            <p>Cet email a été envoyé par TapTopLoad</p>
            <p>Si vous avez besoin d'aide, contactez-nous à support@taptopload.com</p>
          </div>
        </body>
        </html>
      `,
      text: `
Bonjour${firstName ? ' ' + firstName : ''},

Nous avons reçu une demande de réinitialisation de mot de passe pour votre compte TapTopLoad.

Pour réinitialiser votre mot de passe, cliquez sur le lien suivant :
${resetUrl}

Ce lien est valide pendant 1 heure.

Si vous n'avez pas demandé cette réinitialisation, ignorez cet email.

Cordialement,
L'équipe TapTopLoad
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Password reset email sent to ${email}`);
    return true;
  } catch (error) {
    console.error('Error sending password reset email:', error);
    return false;
  }
}

// Verify email configuration
export async function verifyEmailConfig(): Promise<boolean> {
  if (!transporter) {
    return false;
  }

  try {
    await transporter.verify();
    console.log('Email service is ready to send emails');
    return true;
  } catch (error) {
    console.error('Email service verification failed:', error);
    return false;
  }
}
