import { PrismaClient, Role, OrderStatus, PaymentMethod, PaymentStatus, ShippingStatus, DiscountType, InventoryEvent } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // --------------------------
  // 1. USERS
  // --------------------------
  const user = await prisma.user.create({
    data: {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@test.com',
      password: 'hashedpassword',
      role: Role.STORE_OWNER,
      isVerified: true
    }
  });

  const admin = await prisma.user.create({
    data: {
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@test.com',
      password: 'hashedpassword',
      role: Role.ADMIN,
      isVerified: true
    }
  });

  // --------------------------
  // 2. ADDRESSES
  // --------------------------
  const address = await prisma.address.create({
    data: {
      userId: user.id,
      line1: '123 Main Street',
      city: 'New York',
      state: 'NY',
      country: 'USA',
      postal: '10001'
    }
  });

  // --------------------------
  // 3. STORE
  // --------------------------
  const store = await prisma.store.create({
    data: {
      name: 'John’s Electronics',
      slug: 'john-electronics',
      ownerId: user.id
    }
  });

  // --------------------------
  // 4. PRODUCTS
  // --------------------------
  const product1 = await prisma.product.create({
    data: {
      name: 'iPhone 15',
      slug: 'iphone-15',
      description: 'Latest Apple iPhone.',
      price: 999,
      stock: 50,
      images: ['iphone.png'],
      storeId: store.id,
      createdById: user.id,
    }
  });

  const product2 = await prisma.product.create({
    data: {
      name: 'Macbook Pro',
      slug: 'macbook-pro',
      description: '16-inch powerhouse.',
      price: 2499,
      stock: 30,
      images: ['macbook.png'],
      storeId: store.id,
      createdById: user.id,
    }
  });

  // --------------------------
  // 5. CART + CART ITEMS
  // --------------------------
  const cart = await prisma.cart.create({
    data: {
      userId: user.id,
      isActive: true
    }
  });

  const cartItem1 = await prisma.cartItem.create({
    data: {
      cartId: cart.id,
      productId: product1.id,
      quantity: 2
    }
  });

  const cartItem2 = await prisma.cartItem.create({
    data: {
      cartId: cart.id,
      productId: product2.id,
      quantity: 1
    }
  });

  // --------------------------
  // 6. COUPONS + USAGE
  // --------------------------
  const coupon = await prisma.coupon.create({
    data: {
      code: 'WELCOME10',
      description: '10% off for new users',
      discountType: DiscountType.PERCENTAGE,
      discountValue: 10,
      startDate: new Date(),
      endDate: new Date(new Date().setMonth(new Date().getMonth() + 1))
    }
  });

  // --------------------------
  // 7. ORDER
  // --------------------------
  const order = await prisma.order.create({
    data: {
      userId: user.id,
      storeId: store.id,
      total: 999 * 2 + 2499, // sum of cart items
      status: OrderStatus.PAID,
    }
  });

  // --------------------------
  // 8. ORDER ITEMS
  // --------------------------
  const orderItem1 = await prisma.orderItem.create({
    data: {
      orderId: order.id,
      productId: product1.id,
      price: product1.price,
      quantity: 2
    }
  });

  const orderItem2 = await prisma.orderItem.create({
    data: {
      orderId: order.id,
      productId: product2.id,
      price: product2.price,
      quantity: 1
    }
  });

  // --------------------------
  // 9. PAYMENT
  // --------------------------
  const payment = await prisma.payment.create({
    data: {
      orderId: order.id,
      amount: order.total,
      method: PaymentMethod.CARD,
      status: PaymentStatus.PAID,
      transactionId: 'txn_123456789'
    }
  });

  // --------------------------
  // 10. ORDER STATUS HISTORY
  // --------------------------
  await prisma.orderStatusHistory.create({
    data: {
      orderId: order.id,
      status: OrderStatus.PENDING,
      note: 'Order created'
    }
  });

  await prisma.orderStatusHistory.create({
    data: {
      orderId: order.id,
      status: OrderStatus.PAID,
      note: 'Payment completed'
    }
  });

  // --------------------------
  // 11. SHIPPING + TRACKING
  // --------------------------
  const shipping = await prisma.shipping.create({
    data: {
      orderId: order.id,
      provider: 'FedEx',
      trackingNumber: 'FDX123456',
      status: ShippingStatus.SHIPPED,
      addressId: address.id
    }
  });

  await prisma.shippingHistory.create({
    data: {
      shippingId: shipping.id,
      status: ShippingStatus.SHIPPED,
      location: 'New York Warehouse',
      note: 'Package left facility'
    }
  });

  // --------------------------
  // 12. INVENTORY LOGS
  // --------------------------
  await prisma.inventoryLog.create({
    data: {
      productId: product1.id,
      change: -2,
      type: InventoryEvent.PURCHASE
    }
  });

  await prisma.inventoryLog.create({
    data: {
      productId: product2.id,
      change: -1,
      type: InventoryEvent.PURCHASE
    }
  });

  // --------------------------
  // 13. WISHLIST
  // --------------------------
  await prisma.wishlist.create({
    data: {
      userId: user.id,
      productId: product2.id
    }
  });

  // --------------------------
  // 14. REVIEWS
  // --------------------------
  await prisma.review.create({
    data: {
      userId: user.id,
      productId: product1.id,
      rating: 5,
      comment: 'Amazing phone!'
    }
  });

  await prisma.review.create({
    data: {
      userId: user.id,
      productId: product2.id,
      rating: 4,
      comment: 'Very powerful laptop.'
    }
  });

  // --------------------------
  // 15. COUPON USAGE
  // --------------------------
  await prisma.couponUsage.create({
    data: {
      couponId: coupon.id,
      userId: user.id,
      orderId: order.id
    }
  });

  console.log('🌱 Seed completed successfully!');
}

main()
  .catch(e => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
