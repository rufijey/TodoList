import { IsEmail, IsEnum, IsNotEmpty } from 'class-validator';
import { Permission } from '@prisma/client';

export class ShareListDto {
  @IsEmail({}, { message: 'Invalid email format' })
  @IsNotEmpty({ message: 'Email is required' })
  email!: string;

  @IsEnum(Permission, { message: 'Allowed permissions are: READ or WRITE' })
  @IsNotEmpty({ message: 'Permission is required' })
  permission!: Permission;
}
