import { Controller, Get } from '@nestjs/common';
import { MailService } from './mails.service';

@Controller('mail')
export class MailController {
  constructor(private readonly mailService: MailService) {}

  @Get('test')
  async sendTestEmail() {
    await this.mailService.sendMail({
      to: 'shafiqshahzaib@gmail.com',
      subject: 'Test Email — Mail Service Working',
      html: '<h2>Yes! Your email service is working.</h2>',
    });

    return { message: 'Test email sent successfully' };
  }
}
