import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { MessageService } from './message.service';
import { CreateMessageDto } from './dto/createMessage.dto';
import { EditMessageDto } from './dto/editMessage.dto';
import { CurrentUser } from 'src/user/decorators/user.decorator';
import { AuthGuard } from '@nestjs/passport';
import { AttachmentDto } from './dto/attachment.dto';
@Controller('message')
export class MessageController {
  constructor(private readonly messageService: MessageService) {}

  @UseGuards(AuthGuard('jwt'))
  @HttpCode(200)
  @Post()
  async create(
    @Body() dto: CreateMessageDto,
    @CurrentUser('id') userId: number,
  ) {
    return this.messageService.create(userId, dto);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('get-messages')
  async getMessages(
    @CurrentUser('id') userId: number,
    @Body()
    dto: { lastMessageId: number; count: number; smthId: number; type: any },
  ) {
    return this.messageService.getMessages(userId, dto);
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch(':id')
  async edit(
    @Param('id') id: string,
    @Body('content') newContent: string,
    @CurrentUser('id') userId: number,
  ) {
    return this.messageService.edit(parseInt(id), newContent, userId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Delete(':id')
  async delete(@Param('id') id: string, @CurrentUser('id') userId: number) {
    return this.messageService.delete(userId, parseInt(id));
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch('/read-message/:id')
  async markAsRead(@Param('id') id: string, @CurrentUser('id') userId: number) {
    return this.messageService.readUser(parseInt(id), userId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('attachment')
  async attachment(
    @Body() dto: AttachmentDto,
    @CurrentUser('id') userId: number,
  ) {
    return this.messageService.attachment(dto, userId);
  }
}
