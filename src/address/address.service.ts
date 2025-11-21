import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';

@Injectable()
export class AddressService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateAddressDto) {
    return this.prisma.address.create({
      data: dto,
    });
  }

  async findAllByUser(userId: string) {
    return this.prisma.address.findMany({
      where: { userId, isDeleted: false },
    });
  }

  async findOne(id: string) {
    const address = await this.prisma.address.findFirst({
      where: { id, isDeleted: false },
    });

    if (!address) throw new NotFoundException('Address not found');
    return address;
  }

  async update(id: string, dto: UpdateAddressDto) {
    await this.findOne(id);

    return this.prisma.address.update({
      where: { id },
      data: dto,
    });
  }

  async softDelete(id: string) {
    await this.findOne(id);

    return this.prisma.address.update({
      where: { id },
      data: { isDeleted: true },
    });
  }
}
