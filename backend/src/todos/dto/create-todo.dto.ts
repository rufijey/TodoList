import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class CreateTodoDto {
  @IsNotEmpty({ message: 'Todo title is required' })
  @IsString({ message: 'Todo title must be a string' })
  title!: string;

  @IsNotEmpty({ message: 'List ID is required' })
  @IsUUID('4', { message: 'Invalid List ID' })
  listId!: string;
}
