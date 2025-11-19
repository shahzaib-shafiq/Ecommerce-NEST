import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateStoreDto } from './dto/create-store.dto';
import { UpdateStoreDto } from './dto/update-store.dto';

@Injectable()
export class StoresService {
  constructor(private prisma: PrismaService) {}

  // ----------------------------
  // CREATE STORE
  // ----------------------------
  async create(dto: CreateStoreDto) {
    return await this.prisma.store.create({
      data: {
        name: dto.name,
        slug: dto.slug,
        ownerId: dto.ownerId,
        logo: dto.logo,
        summary: dto.summary,
      },
    });
  }

  // ----------------------------
  // FIND ALL STORES
  // ----------------------------
  async findAll() {
    return await this.prisma.store.findMany({
      include: {
        owner: true,
        products: true,
      },
    });
  }

  // ----------------------------
  // FIND ONE STORE
  // ----------------------------
  async findOne(id: string) {
    const store = await this.prisma.store.findUnique({
      where: { id },
      include: {
        owner: true,
        products: true,
      },
    });

    if (!store) throw new NotFoundException('Store not found');

    return store;
  }

  // ----------------------------
  // UPDATE STORE
  // ----------------------------
  async update(id: string, dto: UpdateStoreDto) {
    const exists = await this.prisma.store.findUnique({ where: { id } });
    if (!exists) throw new NotFoundException('Store not found');

    return await this.prisma.store.update({
      where: { id },
      data: dto,
    });
  }

  // ----------------------------
  // DELETE STORE
  // ----------------------------
  async remove(id: string) {
    const exists = await this.prisma.store.findUnique({ where: { id } });
    if (!exists) throw new NotFoundException('Store not found');

    return await this.prisma.store.delete({
      where: { id },
    });
  }
}
