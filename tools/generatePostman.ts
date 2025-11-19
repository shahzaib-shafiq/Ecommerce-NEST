import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';

const prisma = new PrismaClient();

async function main() {
  console.log("⏳ Fetching seeded data...");

  const user = await prisma.user.findFirst();
  const store = await prisma.store.findFirst();
  const product = await prisma.product.findFirst();
  const cart = await prisma.cart.findFirst();
  const order = await prisma.order.findFirst();
  const shipping = await prisma.shipping.findFirst();
  const wishlist = await prisma.wishlist.findFirst();
  const review = await prisma.review.findFirst();
  const coupon = await prisma.coupon.findFirst();

  if (!user) return console.error("❌ No data found. Seed first!");

  const collection = {
    info: {
      _postman_id: "ecs-auto-generated",
      name: "ECS API Collection (Auto-Generated)",
      schema: "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
    },
    item: [
      // ------------------------
      // USERS
      // ------------------------
      {
        name: "Get User Profile",
        request: {
          method: "GET",
          url: `http://localhost:3000/users/${user.id}`
        }
      },

      // ------------------------
      // PRODUCTS
      // ------------------------
      {
        name: "Get All Products",
        request: {
          method: "GET",
          url: `http://localhost:3000/products`
        }
      },
      {
        name: "Get Product by ID",
        request: {
          method: "GET",
          url: `http://localhost:3000/products/${product?.id}`
        }
      },

      // ------------------------
      // CART
      // ------------------------
      {
        name: "Get Cart for User",
        request: {
          method: "GET",
          url: `http://localhost:3000/cart/${user.id}`
        }
      },
      {
        name: "Add Item to Cart",
        request: {
          method: "POST",
          header: [{ key: "Content-Type", value: "application/json" }],
          body: {
            mode: "raw",
            raw: JSON.stringify({
              userId: user.id,
              productId: product?.id,
              quantity: 1
            }, null, 2)
          },
          url: `http://localhost:3000/cart/add`
        }
      },

      // ------------------------
      // STORE
      // ------------------------
      {
        name: "Get Store",
        request: {
          method: "GET",
          url: `http://localhost:3000/store/${store?.id}`
        }
      },

      // ------------------------
      // ORDER
      // ------------------------
      {
        name: "Get Orders for User",
        request: {
          method: "GET",
          url: `http://localhost:3000/orders/${user.id}`
        }
      },
      {
        name: "Get Order Details",
        request: {
          method: "GET",
          url: `http://localhost:3000/orders/details/${order?.id}`
        }
      },
      {
        name: "Create Order",
        request: {
          method: "POST",
          header: [{ key: "Content-Type", value: "application/json" }],
          body: {
            mode: "raw",
            raw: JSON.stringify({
              userId: user.id,
              storeId: store?.id,
              items: [
                {
                  productId: product?.id,
                  quantity: 1
                }
              ]
            }, null, 2)
          },
          url: `http://localhost:3000/orders/create`
        }
      },

      // ------------------------
      // SHIPPING
      // ------------------------
      {
        name: "Get Shipping",
        request: {
          method: "GET",
          url: `http://localhost:3000/shipping/${shipping?.id}`
        }
      },

      // ------------------------
      // REVIEWS
      // ------------------------
      {
        name: "Get Reviews for Product",
        request: {
          method: "GET",
          url: `http://localhost:3000/reviews/product/${product?.id}`
        }
      },
      {
        name: "Add Review",
        request: {
          method: "POST",
          header: [{ key: "Content-Type", value: "application/json" }],
          body: {
            mode: "raw",
            raw: JSON.stringify({
              userId: user.id,
              productId: product?.id,
              rating: 5,
              comment: "Great product!"
            }, null, 2)
          },
          url: `http://localhost:3000/reviews/add`
        }
      },

      // ------------------------
      // WISHLIST
      // ------------------------
      {
        name: "Get Wishlist",
        request: {
          method: "GET",
          url: `http://localhost:3000/wishlist/${user.id}`
        }
      },
      {
        name: "Add to Wishlist",
        request: {
          method: "POST",
          header: [{ key: "Content-Type", value: "application/json" }],
          body: {
            mode: "raw",
            raw: JSON.stringify({
              userId: user.id,
              productId: product?.id
            }, null, 2)
          },
          url: `http://localhost:3000/wishlist/add`
        }
      },

      // ------------------------
      // COUPON
      // ------------------------
      {
        name: "Get Coupon",
        request: {
          method: "GET",
          url: `http://localhost:3000/coupon/${coupon?.code}`
        }
      }
    ]
  };

  // Write collection file
  const outputPath = './postman_collection.json';
  fs.writeFileSync(outputPath, JSON.stringify(collection, null, 2));

  console.log(`\n✅ Postman collection created at: ${outputPath}`);
}

main()
  .catch(err => console.error(err))
  .finally(() => prisma.$disconnect());
