import { PrismaClient, Role, OrderStatus, PaymentMethod, InventoryEvent,Product } from '@prisma/client';

const prisma = new PrismaClient();

const random = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

async function main() {
  console.log("🌱 Running LARGE Seed...");

  // ---------------------------------------------------
  // USERS
  // ---------------------------------------------------
  const users = await Promise.all(
    Array.from({ length: 10 }).map((_, i) =>
      prisma.user.create({
        data: {
          firstName: `User${i + 1}`,
          lastName: `Test${i + 1}`,
          email: `user${i + 1}@example.com`,
          password: "hashed",
          role: i === 0 ? Role.ADMIN : i < 3 ? Role.STORE_OWNER : Role.CUSTOMER,
        },
      })
    )
  );

  const storeOwners = users.filter((u) => u.role === Role.STORE_OWNER);

  // ---------------------------------------------------
  // STORES
  // ---------------------------------------------------
  const stores = await Promise.all(
    storeOwners.map((owner, i) =>
      prisma.store.create({
        data: {
          name: `Store ${i + 1}`,
          slug: `store-${i + 1}`,
          ownerId: owner.id,
        },
      })
    )
  );

  // ---------------------------------------------------
  // Categories
  // ---------------------------------------------------
  const categoryNames = ["Electronics", "Home Appliances", "Clothing", "Books"];
  const categories = await Promise.all(
    categoryNames.map((name) =>
      prisma.category.create({ data: { name } })
    )
  );

  // ---------------------------------------------------
  // Products (50 random products assigned across stores)
  // ---------------------------------------------------
  // Products (50 random products assigned across stores)
const products: Product[] = [];

for (let i = 1; i <= 50; i++) {
  const store = stores[random(0, stores.length - 1)];
  const owner = storeOwners.find((o) => o.id === store.ownerId);

  const product = await prisma.product.create({
    data: {
      name: `Product ${i}`,
      slug: `product-${i}`,
      price: random(10, 2000),
      stock: random(5, 100),
      images: [`product${i}.png`],
      storeId: store.id,
      createdById: owner!.id,
      categoryId: categories[random(0, categories.length - 1)].id,
    },
  });

  products.push(product);
}
  // ---------------------------------------------------
  // Coupons
  // ---------------------------------------------------
  const coupons = await Promise.all([
    prisma.coupon.create({
      data: {
        code: "SUMMER20",
        discountType: "PERCENTAGE",
        discountValue: 20,
        description: "20% off summer sale",
        startDate: new Date(),
        endDate: new Date("2099-01-01"),
      },
    }),
    prisma.coupon.create({
      data: {
        code: "FLAT100",
        discountType: "FLAT",
        discountValue: 100,
        description: "Flat 100 off",
        startDate: new Date(),
        endDate: new Date("2099-01-01"),
      },
    }),
  ]);

  // ---------------------------------------------------
  // Orders (50 orders with items, coupons, shipping, logs)
  // ---------------------------------------------------
  for (let i = 0; i < 50; i++) {
    const customer = users[random(3, users.length - 1)];
    const store = stores[random(0, stores.length - 1)];

    const storeProducts = products.filter((p) => p.storeId === store.id);

    const orderItems = Array.from({ length: random(1, 3) }).map(() => {
      const p = storeProducts[random(0, storeProducts.length - 1)];
      return {
        productId: p.id,
        quantity: random(1, 5),
        price: p.price,
      };
    });

    const total = orderItems.reduce((s, it) => s + it.price * it.quantity, 0);

    const order = await prisma.order.create({
      data: {
        userId: customer.id,
        storeId: store.id,
        total,
        status: OrderStatus.PENDING,

        items: { create: orderItems },

        statusHistory: {
          create: [{ status: OrderStatus.PENDING }],
        },
      },
    });

    // Random coupon usage
    if (Math.random() > 0.7) {
      await prisma.couponUsage.create({
        data: {
          userId: customer.id,
          couponId: coupons[random(0, coupons.length - 1)].id,
          orderId: order.id,
        },
      });
    }

    // Payment
    await prisma.payment.create({
      data: {
        orderId: order.id,
        amount: total,
        method: PaymentMethod.CARD,
        status: "PAID",
        transactionId: `TX-${i}-${Date.now()}`,
      },
    });

    // Address for shipping
    const address = await prisma.address.create({
      data: {
        userId: customer.id,
        line1: "Street Example",
        city: "CityX",
        state: "StateY",
        country: "CountryZ",
        postal: "12345",
      },
    });

    // Shipping
    await prisma.shipping.create({
      data: {
        orderId: order.id,
        provider: "DHL",
        trackingNumber: `TRK-${i}`,
        addressId: address.id,
        history: {
          create: [
            { status: "PENDING" },
            { status: "SHIPPED", note: "Left warehouse" },
            { status: "IN_TRANSIT", note: "In transit" },
          ],
        },
      },
    });

    // Inventory logs
    for (const item of orderItems) {
      await prisma.inventoryLog.create({
        data: {
          productId: item.productId,
          change: -item.quantity,
          type: InventoryEvent.PURCHASE,
        },
      });
    }
  }

  console.log("🌱 LARGE Seed Complete!");
}

main().catch(console.error).finally(() => prisma.$disconnect());
