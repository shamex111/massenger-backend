import { IsNumber, IsString } from "class-validator"

export class AssignRoleDto {
    @IsNumber()
    userId:number
    @IsNumber()
    groupId:number
    @IsString()
    roleName:string
}