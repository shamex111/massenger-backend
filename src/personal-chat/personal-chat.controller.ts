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
} from '@nestjs/common';
import { PersonalChatService } from './personal-chat.service';
import { CreateChatDto } from './dto/createChat.dto';
import { CurrentUser } from 'src/user/decorators/user.decorator';
import { AuthGuard } from '@nestjs/passport';

@Controller('chat')
export class PersonalChatController {
  constructor(private readonly personalChatService: PersonalChatService) {}
  
  @UseGuards(AuthGuard('jwt'))
  @Get(':id')
  async getChat(@CurrentUser('id') userId:number,@Param('id') id:string) {
    return this.personalChatService.getById(userId,parseInt(id))
  }
  
  @UseGuards(AuthGuard('jwt'))
  @Post()
  @HttpCode(200)
  async create(@Body() dto: CreateChatDto,@CurrentUser('id') userId:number) {
    return this.personalChatService.create(dto,userId);
  }

  // @UseGuards(AuthGuard('jwt'))
  // @Patch()
  // async addMessage(
  //   @Body() dto: CreateMessageDto,
  //   @CurrentUser('id') userId: number,
  // ) {
  //   return this.personalChatService.addMessage(dto, userId);
  // }

  @UseGuards(AuthGuard('jwt'))
  @Delete(':id')
  async delete(
    @CurrentUser('id') userId: number,
    @Param('id') id: string,
  ) {
    return this.personalChatService.delete(parseInt(id), userId);
  }
}
