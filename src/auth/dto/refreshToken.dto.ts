import { IsString } from 'class-validator';

export class RefreshTokenDto {
  @IsString({
    message: 'Вы не передали refresh token или это не строка!',
  })
  refreshToken: string;
}
