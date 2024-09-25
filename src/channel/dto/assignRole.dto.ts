import { IsNumber, IsString } from "class-validator"

export class AssignRoleDto {
    @IsNumber()
    userId:number
    @IsNumber()
    channelId:number
    @IsString()
    roleName:string
}