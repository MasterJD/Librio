import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import * as Handlebars from 'handlebars';
import { NotificationType } from '../notifications/dto/create-notification.dto';
import { StructuredLogger } from '../logger/logger.service';

@Injectable()
export class EmailService {
  private readonly logger = new StructuredLogger(EmailService.name);
  private transporter: nodemailer.Transporter;
  private templates: Map<string, HandlebarsTemplateDelegate> = new Map();

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'localhost',
      port: parseInt(process.env.SMTP_PORT || '1025', 10),
      secure: false,
    });

    this.loadTemplates();
  }

  private loadTemplates() {
    const templates: Record<string, string> = {
      [NotificationType.RENTAL_CREATED]: `
        <!DOCTYPE html>
        <html>
        <head><meta charset="utf-8"><style>body{font-family:Arial,sans-serif;margin:40px;}h1{color:#2c3e50;}.btn{display:inline-block;padding:10px 20px;background:#3498db;color:white;text-decoration:none;border-radius:5px;}</style></head>
        <body>
          <h1>📚 Rental Confirmation</h1>
          <p>Hello {{userName}},</p>
          <p>Your rental has been confirmed. Here are the details:</p>
          <ul><li><strong>Book:</strong> {{bookTitle}}</li><li><strong>Author:</strong> {{bookAuthor}}</li><li><strong>Expires:</strong> {{expiresAt}}</li></ul>
          <p>Happy reading!</p>
          <p>Best regards,<br>The Bookly Team</p>
        </body>
        </html>
      `,
      [NotificationType.PURCHASE_CONFIRMATION]: `
        <!DOCTYPE html>
        <html>
        <head><meta charset="utf-8"><style>body{font-family:Arial,sans-serif;margin:40px;}h1{color:#2c3e50;}.btn{display:inline-block;padding:10px 20px;background:#27ae60;color:white;text-decoration:none;border-radius:5px;}</style></head>
        <body>
          <h1>🛒 Purchase Confirmation</h1>
          <p>Hello {{userName}},</p>
          <p>Thank you for your purchase!</p>
          <ul><li><strong>Book:</strong> {{bookTitle}}</li><li><strong>Author:</strong> {{bookAuthor}}</li><li><strong>Price:</strong> \${{price}}</li></ul>
          <p>You can access your book from your library at any time.</p>
          <p>Best regards,<br>The Bookly Team</p>
        </body>
        </html>
      `,
      [NotificationType.RENTAL_EXPIRING]: `
        <!DOCTYPE html>
        <html>
        <head><meta charset="utf-8"><style>body{font-family:Arial,sans-serif;margin:40px;}h1{color:#e74c3c;}.btn{display:inline-block;padding:10px 20px;background:#e74c3c;color:white;text-decoration:none;border-radius 5px;}</style></head>
        <body>
          <h1>⚠️ Rental Expiring Soon</h1>
          <p>Hello {{userName}},</p>
          <p>Your rental for <strong>{{bookTitle}}</strong> is expiring on <strong>{{expiresAt}}</strong>.</p>
          <p>Please return the book or extend your rental to continue reading.</p>
          <p>Best regards,<br>The Bookly Team</p>
        </body>
        </html>
      `,
      [NotificationType.RENTAL_RETURNED]: `
        <!DOCTYPE html>
        <html>
        <head><meta charset="utf-8"><style>body{font-family:Arial,sans-serif;margin:40px;}h1{color:#27ae60;}</style></head>
        <body>
          <h1>✅ Book Returned</h1>
          <p>Hello {{userName}},</p>
          <p>Thank you for returning <strong>{{bookTitle}}</strong>.</p>
          <p>We hope you enjoyed reading it!</p>
          <p>Best regards,<br>The Bookly Team</p>
        </body>
        </html>
      `,
      [NotificationType.WELCOME]: `
        <!DOCTYPE html>
        <html>
        <head><meta charset="utf-8"><style>body{font-family:Arial,sans-serif;margin:40px;}h1{color:#3498db;}</style></head>
        <body>
          <h1>👋 Welcome to Bookly!</h1>
          <p>Hello {{userName}},</p>
          <p>Welcome to Bookly, your digital library platform.</p>
          <p>Start exploring our collection of books today!</p>
          <p>Best regards,<br>The Bookly Team</p>
        </body>
        </html>
      `,
    };

    for (const [type, template] of Object.entries(templates)) {
      this.templates.set(type, Handlebars.compile(template));
    }
  }

  async sendNotification(
    type: string,
    to: string,
    subject: string,
    data: Record<string, any>,
  ): Promise<boolean> {
    try {
      const template = this.templates.get(type);
      const html = template ? template(data) : `<p>${data.message || subject}</p>`;

      await this.transporter.sendMail({
        from: '"Bookly" <noreply@bookly.local>',
        to,
        subject,
        html,
      });

      this.logger.log('Email sent successfully', undefined, { type, to, subject });
      return true;
    } catch (error) {
      this.logger.error('Failed to send email', undefined, {
        type,
        to,
        subject,
        error: error.message,
      });
      return false;
    }
  }
}
