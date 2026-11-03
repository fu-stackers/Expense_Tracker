import { LoginDto } from './dto/login.dto.js';
import { RegisterDto } from './dto/register.dto.js';
import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private readonly Prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto) {
    // const { email, password } = registerDto;
    const existedUser = await this.Prisma.user.findUnique({
      where: { email: registerDto.email },
    });
    if (existedUser) {
      throw new ConflictException('Email already registered');
    }

    const hashedPassword = await bcrypt.hash(registerDto.password, 10);
    const user = await this.Prisma.user.create({
      data: {
        email: registerDto.email,
        password: hashedPassword,
      },
    });
    return {
      id: user.id,
      email: user.email,
      createdAt: user.createdAt,
    };
  }

  async login(loginDto: LoginDto) {
    const user = await this.Prisma.user.findUnique({
      where: { email: loginDto.email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }
    const passwordMatches = await bcrypt.compare(
      loginDto.password,
      user.password,
    );
    if (!passwordMatches) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // 5. Prepare the information to put inside the JWT
    const payload = {
      sub: user.id,
      email: user.email,
    };

    // 6. Create the access token
    const accessToken = await this.jwtService.signAsync(payload);

    // 7 send the token to the user
    return {
      access_token: accessToken,
    };
  }
}
