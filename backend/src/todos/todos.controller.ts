import { Controller, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { TodosService } from './todos.service';
import { CreateTodoDto } from './dto/create-todo.dto';
import { UpdateTodoDto } from './dto/update-todo.dto';
import { AtGuard } from '../users/guards/at.guard';
import { GetCurrentUser } from '../users/decorators/get-current-user.decorator';

@UseGuards(AtGuard)
@Controller('todos')
export class TodosController {
  constructor(private readonly todosService: TodosService) {}

  @Post()
  create(
    @GetCurrentUser('userId') userId: string,
    @GetCurrentUser('email') userEmail: string,
    @Body() createTodoDto: CreateTodoDto,
  ) {
    return this.todosService.create(userId, userEmail, createTodoDto);
  }

  @Patch(':id')
  update(
    @GetCurrentUser('userId') userId: string,
    @GetCurrentUser('email') userEmail: string,
    @Param('id') id: string,
    @Body() updateTodoDto: UpdateTodoDto,
  ) {
    return this.todosService.update(userId, userEmail, id, updateTodoDto);
  }

  @Delete(':id')
  remove(
    @GetCurrentUser('userId') userId: string,
    @GetCurrentUser('email') userEmail: string,
    @Param('id') id: string,
  ) {
    return this.todosService.remove(userId, userEmail, id);
  }
}
