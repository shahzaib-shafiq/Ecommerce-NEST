import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { MailService } from '../mails/mails.service';

@Injectable()
export class CronService {
  private readonly logger = new Logger(CronService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly mailService: MailService,
  ) {}

  // Runs every day at 4 PM server time
  @Cron(CronExpression.EVERY_DAY_AT_4PM)
  async sendDailyPromotionalEmails() {
    this.logger.log('Running daily promotional email job...');

    const users = await this.prisma.user.findMany({
      where: { isDeleted: false },
    });

    if (!users.length) {
      this.logger.log('No users found.');
      return;
    }

    for (const user of users) {
      try {
        await this.mailService.sendPromotionalEmail({
          to: user.email,
          variables: {
            subject: '🔥 Today’s Exclusive Deals Just for You!',
            userName: `${user.firstName} ${user.lastName}`,
            promoTitle: 'Special Offer Inside!',
            promoSubtitle: 'A personalized offer made just for you.',
            promoDescription:
              'Take advantage of today’s limited-time discounts before they expire.',
            highlight1: 'Up to 40% off selected categories',
            highlight2: 'Flash deals available for 24 hours',
            highlight3: 'Free delivery above $50',
            ctaLink: `https://your-website.com/promotions/${user.id}`,
            currentYear: new Date().getFullYear().toString(),
          },
        });

        this.logger.log(`Promotional email sent to: ${user.email}`);
      } catch (error) {
        this.logger.error(
          `Failed to send email to ${user.email}: ${error.message}`,
        );
      }
    }

    this.logger.log('Daily promotional email job finished.');
  }
}
