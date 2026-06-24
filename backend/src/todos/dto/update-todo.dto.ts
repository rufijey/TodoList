import { IsEnum, IsOptional, IsString } from 'class-validator';
import { TodoStatus } from '@prisma/client';

export { TodoStatus };

export class UpdateTodoDto {
  @IsOptional()
  @IsString({ message: 'Todo title must be a string' })
  title?: string;

  @IsOptional()
  @IsEnum(TodoStatus, { message: 'Todo status must be a valid status: TO_DO, IN_PROGRESS, COMPLETED' })
  status?: TodoStatus;
}
