import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import * as fs from 'fs';
import * as path from 'path';
import { Order } from '@prisma/client';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST,
      port: 465,
      secure: true,
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });
  }

  /**
   * Resolve template path - works in both development and production
   */
  private resolveTemplatePath(filename: string): string {
    // Try production path first (dist folder)
    const distPath = path.join(__dirname, 'templates', filename);
    if (fs.existsSync(distPath)) {
      return distPath;
    }

    // Try development path (src folder)
    const srcPath = path.join(process.cwd(), 'src', 'mails', 'templates', filename);
    if (fs.existsSync(srcPath)) {
      return srcPath;
    }

    // Fallback: try relative to __dirname going up one level
    const fallbackPath = path.join(__dirname, '..', 'mails', 'templates', filename);
    if (fs.existsSync(fallbackPath)) {
      return fallbackPath;
    }

    throw new Error(
      `Template file not found: ${filename}. Tried: ${distPath}, ${srcPath}, ${fallbackPath}`,
    );
  }

  /**
   * Load email template from file
   */
  private loadTemplate(templateName: string, isHtml: boolean = true): string {
    try {
      const extension = isHtml ? 'html' : 'txt';
      const filename = `${templateName}-email.${extension}`;
      const templatePath = this.resolveTemplatePath(filename);
      return fs.readFileSync(templatePath, 'utf8');
    } catch (error) {
      this.logger.error(`Failed to load template ${templateName}:`, error);
      throw new Error(`Template ${templateName} not found`);
    }
  }

  /**
   * Replace template variables with actual values
   */
  private replaceTemplateVariables(
    template: string,
    variables: Record<string, string | number>,
  ): string {
    let result = template;

    // Replace simple variables {{variable}}
    Object.keys(variables).forEach((key) => {
      const value = String(variables[key] || '');
      const regex = new RegExp(`{{${key}}}`, 'g');
      result = result.replace(regex, value);
    });

    // Handle conditional blocks {{#if variable}}...{{/if}}
    result = result.replace(
      /\{\{#if\s+(\w+)\}\}([\s\S]*?)\{\{\/if\}\}/g,
      (match, condition: string, content: string) => {
        const conditionValue = variables[condition];
        return conditionValue ? content : '';
      },
    );

    return result;
  }

  async sendMail({
    to,
    subject,
    html,
    text,
  }: {
    to: string;
    subject: string;
    html: string;
    text?: string;
  }): Promise<nodemailer.SentMessageInfo> {
    return await this.transporter.sendMail({
      from: process.env.MAIL_FROM,
      to,
      subject,
      html,
      text,
    });
  }

  async sendOrderCreatedEmail({
    to,
    subject,
    order,
  }: {
    to: string;
    subject: string;
    order: Order;
  }): Promise<nodemailer.SentMessageInfo> {
    // 1. Resolve and load the template HTML
    const templatePath = this.resolveTemplatePath(' order-placed.html');
    const html = fs.readFileSync(templatePath, 'utf8');

    // 2. Inject dynamic values
    const processedHtml = this.replacePlaceholders(html, {
      orderId: order.id,
      orderDate: new Date(order.createdAt).toDateString(),
      orderTotal: `$${order.total.toFixed(2)}`,
      orderLink: `https://your-website.com/orders/${order.id}`,
    });

    // 3. Send email
    return await this.transporter.sendMail({
      from: process.env.MAIL_FROM,
      to,
      subject,
      html: processedHtml,
    });
  }

  private replacePlaceholders(
    template: string,
    data: Record<string, string>,
  ): string {
    return template.replace(/{{(.*?)}}/g, (_, key: string) => {
      const trimmedKey = key.trim();
      return data[trimmedKey] || '';
    });
  }
}
