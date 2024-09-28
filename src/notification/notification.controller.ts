import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { NotificationService } from './notification.service';
import { CurrentUser } from 'src/user/decorators/user.decorator';
import { AuthGuard } from '@nestjs/passport';

@Controller('notification')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @UseGuards(AuthGuard('jwt'))
  @Post()
  @HttpCode(200)
  async getNotification(
    @Body()
    dto: { memberId: number; smthId: number; type: 'channel' | 'group' },
    @CurrentUser('id') userId: number,
  ) {
    return this.notificationService.getNotification(dto, userId);
  }
}
