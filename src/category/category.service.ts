import { Injectable, NotFoundException ,BadRequestException} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoryService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateCategoryDto) {
    const exists = await this.prisma.category.findFirst({
      where: {
        name: { equals: dto.name, mode: 'insensitive' },
        isDeleted: false,   // only reject if ACTIVE category exists
      },
    });
  
    if (exists) {
      throw new BadRequestException('Category with this name already exists');
    }
  
    return this.prisma.category.create({
      data: {
        name: dto.name.trim(),
      },
    });
  }
  

  async findAll() {
    return this.prisma.category.findMany({
      where: { isDeleted: false },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string) {
    const category = await this.prisma.category.findUnique({ where: { id } });

    if (!category || category.isDeleted) {
      throw new NotFoundException('Category not found');
    }

    return category;
  }

  async update(id: string, dto: UpdateCategoryDto) {
    const exists = await this.prisma.category.findUnique({
      where: { id },
    });

    if (!exists || exists.isDeleted) {
      throw new NotFoundException('Category not found');
    }

    return this.prisma.category.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: string) {
    const exists = await this.prisma.category.findUnique({
      where: { id },
    });

    if (!exists || exists.isDeleted) {
      throw new NotFoundException('Category not found');
    }

    // SOFT DELETE
    return this.prisma.category.update({
      where: { id },
      data: { isDeleted: true },
    });
  }
}
