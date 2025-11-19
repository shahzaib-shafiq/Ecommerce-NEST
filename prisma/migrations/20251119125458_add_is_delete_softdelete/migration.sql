-- AlterTable
ALTER TABLE "Address" ADD COLUMN     "isDeleted" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Cart" ADD COLUMN     "isDeleted" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Category" ADD COLUMN     "isDeleted" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Coupon" ADD COLUMN     "isDeleted" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "isDeleted" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Review" ADD COLUMN     "isDeleted" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Shipping" ADD COLUMN     "isDeleted" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Store" ADD COLUMN     "isDeleted" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Wishlist" ADD COLUMN     "isDeleted" BOOLEAN NOT NULL DEFAULT false;
