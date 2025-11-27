import { Injectable, NotFoundException,ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateStoreDto } from './dto/create-store.dto';
import { UpdateStoreDto } from './dto/update-store.dto';
import { Role } from '../../common/enums/Roles';
@Injectable()
export class StoresService {
  constructor(private prisma: PrismaService) {}

  // ----------------------------
  // CREATE STORE
  // ----------------------------
  async create(dto: CreateStoreDto) {
    // CHECK IF USER EXISTS
    const user = await this.prisma.user.findUnique({
      where: { id: dto.ownerId },
    });
    
  
    if (!user) {
      throw new NotFoundException(`User with ID ${dto.ownerId} not found`);
    }
  
    // CHECK IF USER ROLE IS STORE_OWNER
    if (user.role !== Role.STORE_OWNER) {
      throw new ForbiddenException(`User is not a store owner`);
    }
  
    // CREATE STORE
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
      where: { isDeleted: false },
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
      where: { id,isDeleted:false },
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
  
    return this.prisma.store.update({
      where: { id ,isDeleted: false, },
      data: { isDeleted: true },
    });
  }
  
}
