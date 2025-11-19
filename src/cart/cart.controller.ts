import { Controller, Post, Body, Param, Patch, Delete, Get } from '@nestjs/common';
import { CartService } from './cart.service';
import { CreateCartDto } from './dto/create-cart.dto';
import { AddCartItemDto } from './dto/add-cart-item.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';

@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  // ----------------------------------------
  // CREATE CART FOR USER
  // POST /cart
  // ----------------------------------------
  @Post()
  create(@Body() dto: CreateCartDto) {
    return this.cartService.create(dto);
  }

  // ----------------------------------------
  // GET ACTIVE CART BY USER
  // GET /cart/user/:userId
  // ----------------------------------------
  @Get('user/:userId')
  findCartByUser(@Param('userId') userId: string) {
    return this.cartService.findCartByUser(userId);
  }

  // ----------------------------------------
  // ADD ITEM TO CART
  // POST /cart/item
  // ----------------------------------------
  @Post('item')
  addItem(@Body() dto: AddCartItemDto) {
    return this.cartService.addItem(dto);
  }

  // ----------------------------------------
  // UPDATE CART ITEM QUANTITY
  // PATCH /cart/item/:itemId
  // ----------------------------------------
  @Patch('item/:itemId')
  updateItem(@Param('itemId') itemId: string, @Body() dto: UpdateCartItemDto) {
    return this.cartService.updateItem(itemId, dto);
  }

  // ----------------------------------------
  // REMOVE ITEM FROM CART
  // DELETE /cart/item/:itemId
  // ----------------------------------------
  @Delete('item/:itemId')
  removeItem(@Param('itemId') itemId: string) {
    return this.cartService.removeItem(itemId);
  }

  // ----------------------------------------
  // CLEAR CART
  // DELETE /cart/clear/:cartId
  // ----------------------------------------
  @Delete('clear/:cartId')
  clearCart(@Param('cartId') cartId: string) {
    return this.cartService.clear(cartId);
  }
}
