import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import Stripe from "stripe";

@Injectable()
export class PaymentsService {
  private stripe: Stripe | null = null;
  private readonly logger = new Logger(PaymentsService.name);

  constructor(private configService: ConfigService) {
    const key = this.configService.get<string>("STRIPE_SECRET_KEY");
    if (key && !key.startsWith("sk_test_placeholder")) {
      this.stripe = new Stripe(key, { apiVersion: "2025-11-17.clover" });
    } else {
      this.logger.warn(
        "STRIPE_SECRET_KEY not configured – payment features disabled",
      );
    }
  }

  private ensureStripe(): Stripe {
    if (!this.stripe) {
      throw new Error("Stripe is not configured. Set STRIPE_SECRET_KEY in .env");
    }
    return this.stripe;
  }

  async createPaymentIntent(amount: number, currency: string) {
    const stripe = this.ensureStripe();
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency,
      automatic_payment_methods: { enabled: true },
    });

    return {
      clientSecret: paymentIntent.client_secret,
    };
  }

  verifyWebhookSignature(rawBody: Buffer, signature: string) {
    const stripe = this.ensureStripe();
    const webhookSecret =
      this.configService.get<string>("STRIPE_WEBHOOK_SECRET")!;

    try {
      return stripe.webhooks.constructEvent(
        rawBody,
        signature,
        webhookSecret,
      );
    } catch (err) {
      throw new Error(`Webhook signature verification failed: ${err.message}`);
    }
  }
}
