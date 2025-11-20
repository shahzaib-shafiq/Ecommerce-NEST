// prisma/seed.ts
import { PrismaClient, Role, OrderStatus, PaymentMethod } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Running Minimal Seed...');

  // ---------------------------
  // USERS
  // ---------------------------
  const admin = await prisma.user.create({
    data: {
      firstName: "Admin",
      lastName: "User",
      email: "admin@example.com",
      password: "hashedpassword",
      role: Role.ADMIN,
    },
  });

  const owner = await prisma.user.create({
    data: {
      firstName: "Store",
      lastName: "Owner",
      email: "owner@example.com",
      password: "hashedpassword",
      role: Role.STORE_OWNER,
    },
  });

  const customer = await prisma.user.create({
    data: {
      firstName: "John",
      lastName: "Doe",
      email: "customer@example.com",
      password: "hashedpassword",
      role: Role.CUSTOMER,
    },
  });

  // ---------------------------
  // STORE
  // ---------------------------
  const store = await prisma.store.create({
    data: {
      name: "Tech Store",
      slug: "tech-store",
      ownerId: owner.id,
    },
  });

  // ---------------------------
  // CATEGORY
  // ---------------------------
  const category = await prisma.category.create({
    data: {
      name: "Electronics",
    },
  });

  // ---------------------------
  // PRODUCTS
  // ---------------------------
  const product1 = await prisma.product.create({
    data: {
      name: "iPhone 15",
      slug: "iphone-15",
      price: 1199,
      stock: 50,
      images: ["iphone_15.png"],
      storeId: store.id,
      createdById: owner.id,
      categoryId: category.id,
    },
  });

  const product2 = await prisma.product.create({
    data: {
      name: "Samsung S24",
      slug: "samsung-s24",
      price: 999,
      stock: 40,
      images: ["s24.png"],
      storeId: store.id,
      createdById: owner.id,
      categoryId: category.id,
    },
  });

  // ---------------------------
  // COUPON
  // ---------------------------
  const coupon = await prisma.coupon.create({
    data: {
      code: "WELCOME10",
      description: "10% off",
      discountType: "PERCENTAGE",
      discountValue: 10,
      startDate: new Date(),
      endDate: new Date("2099-01-01"),
      isActive: true,
    },
  });

  // ---------------------------
  // ORDER
  // ---------------------------
  const order = await prisma.order.create({
    data: {
      userId: customer.id,
      storeId: store.id,
      status: OrderStatus.PENDING,
      total: product1.price * 2 + product2.price * 1,

      items: {
        create: [
          { productId: product1.id, quantity: 2, price: product1.price },
          { productId: product2.id, quantity: 1, price: product2.price },
        ],
      },

      couponUsage: {
        create: {
          userId: customer.id,
          couponId: coupon.id,
        },
      },

      statusHistory: {
        create: { status: OrderStatus.PENDING },
      },
    },
  });

  // ---------------------------
  // PAYMENT
  // ---------------------------
  await prisma.payment.create({
    data: {
      orderId: order.id,
      amount: order.total,
      method: PaymentMethod.CARD,
      status: "PAID",
      transactionId: "TX12345",
    },
  });

  // ---------------------------
  // SHIPPING
  // ---------------------------
  const address = await prisma.address.create({
    data: {
      userId: customer.id,
      line1: "Street 1",
      city: "Karachi",
      state: "Sindh",
      country: "Pakistan",
      postal: "12345",
    },
  });

  await prisma.shipping.create({
    data: {
      orderId: order.id,
      provider: "DHL",
      trackingNumber: "TRACK123",
      addressId: address.id,
      history: {
        create: [
          { status: "PENDING" },
          { status: "SHIPPED", note: "Left warehouse" },
        ],
      },
    },
  });

  console.log("🌱 Minimal Seed Complete!");
}

main().catch(console.error).finally(() => prisma.$disconnect());
