import { Injectable, BadRequestException, UnauthorizedException, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from 'src/user/user.service';
import { AuthDto } from './dto/Auth.dto';
import { verify } from 'argon2';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwt: JwtService,
  ) {}

  async register(dto: AuthDto) {
    dto.username = dto.username.toLowerCase();
    let oldUser = await this.userService.getUser(dto.username);
    if (oldUser) throw new BadRequestException('Пользователь уже существует!');

    const user = await this.userService.create(dto);
    const tokens = this.issueTokens(user);

    return {
      user,
      ...tokens,
    };
  }

  async login(dto: AuthDto) {
    const user = await this.validateUser(dto);
    const tokens = this.issueTokens(user);
    return { user, ...tokens };
  }

  async getNewTokens(refreshToken: string) {
    const result = this.jwt.verify(refreshToken);
    if (!result) throw new UnauthorizedException('Невалидный refresh токен');
    let user = await this.userService.getUser(result.username);
    user = await this.userService.getById(user.id)
    const tokens = this.issueTokens(user);

    return {
      user,
      ...tokens,
    };
  }

  private issueTokens(user: { id: number; username: string }) {
    const payload = { id: user.id, username: user.username };

    const accessToken = this.jwt.sign(payload, {
      expiresIn:'1h',
    });

    const refreshToken = this.jwt.sign(payload, {
      expiresIn: '7d',
    });
    return { accessToken, refreshToken };
  }

  private async validateUser(dto: AuthDto) {
    let user = await this.userService.getUser(dto.username);
    user = await this.userService.getById(user.id)
    if (!user) throw new NotFoundException('Пользователь не найден!');

    const isValidPassword = await verify(user.password, dto.password);
    if (!isValidPassword) throw new UnauthorizedException('Неверный пароль!');

    return user;
  }
}
