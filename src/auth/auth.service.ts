import {
  Injectable,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { CreateAuthDto } from './dto/create-auth.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async login(createAuthDto: CreateAuthDto) {
    const { email, password } = createAuthDto;

    // 1. Find user
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) throw new NotFoundException('User not found');

    // 2. Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new UnauthorizedException('Invalid credentials');

    // 3. Create JWT payload (encrypted)
    const payload = {
      sub: user.id,
      role: user.role,
    };

    const token = await this.jwtService.signAsync(payload);

    // 4. Remove password before returning
    const { password: _, ...safeUser } = user;

    return {
      message: 'Login successful',
      access_token: token,
      user: safeUser,
    };
  }
}
