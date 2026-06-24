import { IsNotEmpty, IsString } from 'class-validator';

export class CreateTodoListDto {
  @IsNotEmpty({ message: 'List name is required' })
  @IsString({ message: 'List name must be a string' })
  name!: string;
}
