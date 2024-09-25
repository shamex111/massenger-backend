import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ChannelService } from './channel.service';
import { AuthGuard } from '@nestjs/passport';
import { CreateChannelDto } from './dto/createChannel.dto';
import { CurrentUser } from 'src/user/decorators/user.decorator';
import { EditChannelDto } from './dto/editChannel.dto';
import { AddMemberDto } from './dto/addMember.dto';
import { DeleteMemberDto } from './dto/deleteMember.dto';
import { CreateRoleDto } from './dto/createRole.dto';
import { RemoveRoleDto } from './dto/removeRole.dto';
import { AssignRoleDto } from './dto/assignRole.dto';
import { EditRoleDto } from './dto/editRole.dto';
import { DeleteRoleDto } from './dto/deleteRole.dto';
import { changeNotificationsDto } from './dto/changeNotifications.dto';

@Controller('channel')
export class ChannelController {
  constructor(private readonly channelService: ChannelService) {}

  @UseGuards(AuthGuard('jwt'))
  @Get(':id')
  async getChannel(@Param('id') id: string, @CurrentUser('id') userId: number) {
    return this.channelService.getById(userId, parseInt(id));
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('search-channels/:param')
  async searchChannels(@Param('param') param: string) {
    return this.channelService.searchChannels(param);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post()
  @HttpCode(200)
  async create(
    @Body() dto: CreateChannelDto,
    @CurrentUser('id') userId: number,
  ) {
    return this.channelService.create(dto, userId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch()
  async edit(@Body() dto: EditChannelDto, @CurrentUser('id') userId: number) {
    return this.channelService.edit(dto, userId);
  }
  @UseGuards(AuthGuard('jwt'))
  @Delete(':id')
  async delete(
    @Param('id') channelId: string,
    @CurrentUser('id') userId: number,
  ) {
    return this.channelService.delete(parseInt(channelId), userId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('/members/add-member')
  @HttpCode(200)
  async addMember(
    @Body() dto: AddMemberDto,
    @CurrentUser('id') userId: number,
  ) {
    return this.channelService.addMember(dto, userId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Delete('/members/delete-member')
  async deleteMember(
    @Query('userId') targetUserId: string,
    @Query('channelId') channelId: string,
    @CurrentUser('id') userId: number,
  ) {
    const dto = { userId: parseInt(targetUserId), channelId:parseInt(channelId) };
    return this.channelService.deleteMember(dto, userId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('/roles/create-role')
  @HttpCode(200)
  async createRole(
    @Body() dto: CreateRoleDto,
    @CurrentUser('id') userId: number,
  ) {
    return this.channelService.createRole(dto, userId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch('/roles/remove-role')
  async removeRole(
    @Body() dto: RemoveRoleDto,
    @CurrentUser('id') userId: number,
  ) {
    return this.channelService.removeRole(dto, userId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch('/roles/assign-role')
  async assignRole(
    @Body() dto: AssignRoleDto,
    @CurrentUser('id') userId: number,
  ) {
    return this.channelService.assignRole(dto, userId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch('/roles/edit-role')
  async editRole(@Body() dto: EditRoleDto, @CurrentUser('id') userId: number) {
    return this.channelService.editRole(dto, userId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Delete('/roles/delete-role')
  async deleteRole(
    @Query('roleName') roleName: string,
    @Query('channelId') channelId: string,
    @CurrentUser('id') userId: number,
  ) {
    const dto = { roleName, channelId: parseInt(channelId, 10) };
    return this.channelService.deleteRole(dto, userId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('/create-discussion')
  @HttpCode(200)
  async createDiscussion(
    @Body('channelId') channelId: number,
    @CurrentUser('id') userId: number,
  ) {
    return this.channelService.createDiscussion(channelId, userId);
  }
  @UseGuards(AuthGuard('jwt'))
  @Delete('/delete-discussion/:id')
  @HttpCode(200)
  async deleteDiscussion(
    @Param('id') channelId: string,
    @CurrentUser('id') userId: number,
  ) {
    return this.channelService.deleteDiscussion(
      parseInt(channelId, 10),
      userId,
    );
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('/list-members/:id')
  async listMembers(
    @Param('id') channelId: string,
    @CurrentUser('id') userId: number,
  ) {
    return this.channelService.listMembers(parseInt(channelId), userId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('/list-roles/:id')
  async listRoles(
    @Param('id') channelId: string,
    @CurrentUser('id') userId: number,
  ) {
    return this.channelService.listRoles(parseInt(channelId), userId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('/list-permissions')
  async listPermissions() {
    return this.channelService.listPermissions();
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch('/change-notifications')
  async changeNotifications(
    @Body() dto: changeNotificationsDto,
    @CurrentUser('id') userId: number,
  ) {
    return this.channelService.changeUserNotification(dto, userId);
  }
}
