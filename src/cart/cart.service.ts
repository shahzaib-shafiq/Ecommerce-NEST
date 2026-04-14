import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCartDto } from './dto/create-cart.dto';
import { AddCartItemDto } from './dto/add-cart-item.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';

@Injectable()
export class CartService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateCartDto) {
    return await this.prisma.cart.create({
      data: {
        userId: dto.userId,
      },
    });
  }

  async findCartByUser(userId: string) {
    const cart = await this.prisma.cart.findFirst({
      where: { userId, isActive: true, isDeleted: false },
      include: { items: { include: { product: true } } },
    });

    if (!cart) throw new NotFoundException('Active cart not found');

    return cart;
  }

  async addItem(dto: AddCartItemDto) {
    return await this.prisma.$transaction(async (tx) => {
      const product = await tx.product.findUnique({
        where: { id: dto.productId },
      });

      if (!product || product.isDeleted) {
        throw new NotFoundException('Product not found');
      }

      if (product.stock < dto.quantity) {
        throw new BadRequestException(
          `Insufficient stock. Available: ${product.stock}, Requested: ${dto.quantity}`,
        );
      }

      return tx.cartItem.create({
        data: {
          cartId: dto.cartId,
          productId: dto.productId,
          quantity: dto.quantity,
        },
      });
    });
  }

  // ----------------------------
  // UPDATE CART ITEM QUANTITY
  // ----------------------------
  async updateItem(itemId: string, dto: UpdateCartItemDto) {
    const item = await this.prisma.cartItem.findUnique({
      where: { id: itemId },
    });

    if (!item) throw new NotFoundException('Cart item not found');

    return await this.prisma.cartItem.update({
      where: { id: itemId },
      data: dto,
    });
  }

  // ----------------------------
  // REMOVE ITEM
  // ----------------------------
  async removeItem(itemId: string) {
    const exists = await this.prisma.cartItem.findUnique({
      where: { id: itemId },
    });

    if (!exists) throw new NotFoundException('Item not found');

    return await this.prisma.cartItem.delete({
      where: { id: itemId },
    });
  }

  // ----------------------------
  // CLEAR CART
  // ----------------------------
  async clear(cartId: string) {
    await this.prisma.cartItem.deleteMany({ where: { cartId } });

    return { message: 'Cart cleared' };
  }
}
