import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  // ----------------------------
  // CREATE PRODUCT
  // ----------------------------
  async create(dto: CreateProductDto) {
    return await this.prisma.product.create({
      data: {
        name: dto.name,
        slug: dto.slug,
        description: dto.description,
        price: dto.price,
        stock: dto.stock,
        images: dto.images ?? [],
        storeId: dto.storeId,
        createdById: dto.createdById,
      },
    });
  }

  // ----------------------------
  // GET ALL PRODUCTS
  // ----------------------------
  async findAll() {
    return await this.prisma.product.findMany({
      where: { isDeleted: false },
      include: {
        store: true,
        createdBy: true,
      },
    });
  }

  // ----------------------------
  // GET PRODUCT BY ID
  // ----------------------------
  async findOne(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: {
        store: true,
        createdBy: true,
      },
    });

    if (!product || product.isDeleted)
      throw new NotFoundException('Product not found');

    return product;
  }

  // ----------------------------
  // UPDATE PRODUCT
  // ----------------------------
  async update(id: string, dto: UpdateProductDto) {
    const exists = await this.prisma.product.findUnique({ where: { id } });

    if (!exists || exists.isDeleted)
      throw new NotFoundException('Product not found');

    return await this.prisma.product.update({
      where: { id },
      data: dto,
    });
  }

  // ----------------------------
  // SOFT DELETE PRODUCT
  // ----------------------------
  async remove(id: string) {
    const exists = await this.prisma.product.findUnique({ where: { id } });

    if (!exists || exists.isDeleted)
      throw new NotFoundException('Product not found');

    return await this.prisma.product.update({
      where: { id },
      data: { isDeleted: true },
    });
  }
}
