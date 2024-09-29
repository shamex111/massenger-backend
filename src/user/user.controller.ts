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
import { UserService } from './user.service';
import { AuthDto } from 'src/auth/dto/Auth.dto';
import { UpdateUserDto } from './dto/updateUser.dto';
import { CurrentUser } from './decorators/user.decorator';
import { AuthGuard } from '@nestjs/passport';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}
  
  @UseGuards(AuthGuard('jwt'))
  @Get('search-users/:param')
  async searchUsers(@Param('param') param:string){
    return this.userService.searchUsers(param)
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('profile')
  async getProfile(@CurrentUser('username') username: string) {
    return this.userService.getProfile(username);
  }

  @Get(':username')
  async getUser(@Param('username') username: string) {
    return this.userService.getUser(username);
  }
  
  @Get('by-id/:id')
  async getByIdForClients(@Param('id') id: string) {
    return this.userService.getByIdForClients(parseInt(id));
  }

  @HttpCode(200)
  @Post()
  async create(@Body() dto: AuthDto) {
    return this.userService.create(dto);
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch()
  async edit(@Body() dto: UpdateUserDto, @CurrentUser('id') id: number) {
    return this.userService.edit(dto, id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Delete()
  async delete(@CurrentUser('id') id: number) {
    return this.userService.delete(id);
  }
  @UseGuards(AuthGuard('jwt'))
  @Patch('/update-last-online')
  async updateLastOnline(@CurrentUser('id') id: number) {
    return this.userService.updateLastOnline(id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch('/set-online-status')
  async setOnlineStatus(@CurrentUser('id') id: number,@Body() dto:{action:'offline' | 'online'}) {
    console.log(id,dto.action)
    return this.userService.setOnlineStatus(id,dto.action);
  }
}
