import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class MailService {
  private transporter;

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
  }) {
    return await this.transporter.sendMail({
      from: process.env.MAIL_FROM,
      to,
      subject,
      html,
      text,
    });
  }


  async sendOrderCreatedEmail(order: any) {
    
    
    const templatePath = path.join(__dirname, 'templates', 'order-placed.html');

    // 1. Load the template HTML
    let html = fs.readFileSync(templatePath, 'utf8');

    // 2. Inject dynamic values
    html = this.replacePlaceholders(html, {
      orderId: order.id,
      orderDate: new Date(order.createdAt).toDateString(),
      orderTotal: `$${order.totalPrice}`,
      orderLink: `https://your-website.com/orders/${order.id}`,
    });

    // 3. Send email
    return this.transporter.sendMail({
      to: order.customerEmail,
      subject: `Order Confirmation #${order.id}`,
      html,
    });
  }

  private replacePlaceholders(template: string, data: Record<string, any>) {
    return template.replace(/{{(.*?)}}/g, (_, key) => {
      const trimmedKey = key.trim();
      return data[trimmedKey] || '';
    });
  }

  // async sendOrderCreatedEmail({ to, subject, order }) {
  //    // 1. Load HTML template file
  //    const templatePath = path.join(
  //     __dirname,
  //     'templates',
  //     'order-placed.html',
  //   );

  //   let html = fs.readFileSync(templatePath, 'utf8');

  //   // 2. Replace dynamic variables
  //   html = html
  //     .replace('{{ORDER_ID}}', order.id)
  //     .replace('{{ORDER_AMOUNT}}', order.totalPrice)
  //     .replace('{{CUSTOMER_NAME}}', order.customerName);

  //     // 3. Send the email
  //     return this.transporter.sendMail({
  //       to,
  //       subject,
  //       html, // use HTML content instead of template engine
  //     });
  // }
}
