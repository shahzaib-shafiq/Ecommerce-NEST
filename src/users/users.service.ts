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

  // FIND ALL USERS (excluding soft-deleted)
  async findAll() {
    const users = await this.prisma.user.findMany({
      where: { isDeleted: false },
      orderBy: { createdAt: 'desc' },
    });

    return users.map((u) => {
      const { password, ...safe } = u;
      return safe;
    });
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
