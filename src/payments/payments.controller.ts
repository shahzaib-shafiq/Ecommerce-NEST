import {
  Body,
  Controller,
  Post,
  Req,
  Headers,
  UseGuards,
} from "@nestjs/common";
import type { RawBodyRequest } from "@nestjs/common";
import { PaymentsService } from "./payments.service";
import { CreatePaymentIntentDto } from "./dto/create-payment-intent.dto";
import { JwtAuthGuard } from "src/auth/jwt-auth.guard";

@Controller("payments")
export class PaymentsController {
  constructor(private paymentsService: PaymentsService) {}

  @UseGuards(JwtAuthGuard)
  @Post("create-payment-intent")
  async createPaymentIntent(@Body() dto: CreatePaymentIntentDto) {
    return this.paymentsService.createPaymentIntent(dto.amount, dto.currency);
  }

  @Post("webhook")
  async webhook(
    @Req() req: RawBodyRequest<Request>,
    @Headers("stripe-signature") signature: string,
  ) {
    const rawBody = req.rawBody as Buffer; // 🟢 safe cast

    const event = this.paymentsService.verifyWebhookSignature(
      rawBody,
      signature,
    );

    switch (event.type) {
      case "payment_intent.succeeded":
        console.log("💰 Payment Succeeded:", event.data.object.id);
        break;

      case "payment_intent.payment_failed":
        console.log("❌ Payment Failed:", event.data.object.id);
        break;
    }

    return { received: true };
  }
}
