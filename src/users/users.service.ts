import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  // CREATE USER
  async create(createUserDto: CreateUserDto) {
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    const user = await this.prisma.user.create({
      data: {
        ...createUserDto,
        password: hashedPassword,
      },
    });

    // Never return password
    const { password, ...safeUser } = user;
    return safeUser;
  }

  async findAll(page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where: { isDeleted: false },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.user.count({ where: { isDeleted: false } }),
    ]);

    const items = users.map((u) => {
      const { password, ...safe } = u;
      return safe;
    });

    return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  // FIND ONE USER
  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) throw new NotFoundException('User not found');

    const { password, ...safeUser } = user;
    return safeUser;
  }

  // UPDATE USER
  async update(id: string, updateUserDto: UpdateUserDto) {
    // If password is updated, re-hash it
    if (updateUserDto.password) {
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
    }

    const user = await this.prisma.user.update({
      where: { id },
      data: updateUserDto,
    });

    const { password, ...safeUser } = user;
    return safeUser;
  }

  // SOFT DELETE USER
  async remove(id: string) {
    const user = await this.prisma.user.update({
      where: { id },
      data: { isDeleted: true },
    });

    return { message: 'User soft-deleted successfully' };
  }
}
