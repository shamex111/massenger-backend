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
import { GroupService } from './group.service';
import { CreateRoleDto } from './dto/createRole.dto';
import { CreateGroupDto } from './dto/createGroup.dto';
import { AddMemberDto } from './dto/addMember.dto';
import { CurrentUser } from 'src/user/decorators/user.decorator';
import { AuthGuard } from '@nestjs/passport';
import { DeleteMemberDto } from './dto/deleteMember.dto';
import { RemoveRoleDto } from './dto/removeRole.dto';
import { AssignRoleDto } from './dto/assignRole.dto';
import { EditRoleDto } from './dto/editRole.dto';
import { DeleteRoleDto } from './dto/deleteRole.dto';
import { EditGroupDto } from './dto/editGroup.dto';
import { changeNotificationsDto } from './dto/changeNotifications.dto';

@Controller('group')
export class GroupController {
  constructor(private readonly groupService: GroupService) {}

  @UseGuards(AuthGuard('jwt'))
  @Get(':id')
  async getGroup(@Param('id') id:string,@CurrentUser('id') userId: number) {
    return this.groupService.getById(userId,parseInt(id))
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('search-groups/:param')
  async searchGroups(@Param('param') param:string){
    return this.groupService.searchGroups(param)
  }

  @UseGuards(AuthGuard('jwt'))
  @Post()
  @HttpCode(200)
  async create(@Body() dto: CreateGroupDto, @CurrentUser('id') userId: number) {
    return this.groupService.create(dto, userId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch()
  async edit(@Body() dto: EditGroupDto, @CurrentUser('id') userId: number) {
    return this.groupService.edit(dto, userId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Delete()
  async delete(@Body('groupId') groupId: number, @CurrentUser('id') userId: number) {
    return this.groupService.delete(groupId, userId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('/members/add-member')
  @HttpCode(200)
  async addMember(@Body() dto: AddMemberDto, @CurrentUser('id') userId: number) {
    return this.groupService.addMember(dto, userId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Delete('/members/delete-member')
  async deleteMember(@Body() dto: DeleteMemberDto, @CurrentUser('id') userId: number) {
    return this.groupService.deleteMember(dto, userId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('/roles/create-role')
  @HttpCode(200)
  async createRole(@Body() dto: CreateRoleDto, @CurrentUser('id') userId: number) {
    return this.groupService.createRole(dto, userId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch('/roles/remove-role')
  async removeRole(@Body() dto: RemoveRoleDto, @CurrentUser('id') userId: number) {
    return this.groupService.removeRole(dto, userId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch('/roles/assign-role')
  async assignRole(@Body() dto: AssignRoleDto, @CurrentUser('id') userId: number) {
    return this.groupService.assignRole(dto, userId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch('/roles/edit-role')
  async editRole(@Body() dto: EditRoleDto, @CurrentUser('id') userId: number) {
    return this.groupService.editRole(dto, userId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Delete('/roles/delete-role')
  async deleteRole(@Body() dto: DeleteRoleDto, @CurrentUser('id') userId: number) {
    return this.groupService.deleteRole(dto, userId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('/list-members/:groupId')
  async listMembers(@Param('groupId') groupId: number, @CurrentUser('id') userId: number) {
    return this.groupService.listMembers(groupId, userId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('/list-roles/:groupId')
  async listRoles(@Param('groupId') groupId: number, @CurrentUser('id') userId: number) {
    return this.groupService.listRoles(groupId, userId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('/list-permissions')
  async listPermissions() {
    return this.groupService.listPermissions();
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch('/change-notifications')
  async changeNotifications(@Body() dto: changeNotificationsDto, @CurrentUser('id') userId: number) {
    return this.groupService.changeUserNotification(dto, userId);
  }

  @Post('gg')
  async gg(@Body() dto:any){
    return this.groupService.gg(dto)
  }
}

