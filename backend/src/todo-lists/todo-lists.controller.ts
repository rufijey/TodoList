import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { TodoListsService } from './todo-lists.service';
import { CreateTodoListDto } from './dto/create-todo-list.dto';
import { ShareListDto } from './dto/share-list.dto';
import { AtGuard } from '../users/guards/at.guard';
import { GetCurrentUser } from '../users/decorators/get-current-user.decorator';

@UseGuards(AtGuard)
@Controller('todo-lists')
export class TodoListsController {
  constructor(private readonly todoListsService: TodoListsService) {}

  @Post()
  create(@GetCurrentUser('userId') userId: string, @Body() createTodoListDto: CreateTodoListDto) {
    return this.todoListsService.create(userId, createTodoListDto);
  }

  @Get()
  findAll(
    @GetCurrentUser('userId') userId: string,
    @GetCurrentUser('email') userEmail: string,
  ) {
    return this.todoListsService.findAll(userId, userEmail);
  }

  @Get(':slug')
  findOne(
    @GetCurrentUser('userId') userId: string,
    @GetCurrentUser('email') userEmail: string,
    @Param('slug') slug: string,
  ) {
    return this.todoListsService.findOneBySlug(userId, userEmail, slug);
  }

  @Patch(':id')
  update(
    @GetCurrentUser('userId') userId: string,
    @Param('id') id: string,
    @Body() updateTodoListDto: CreateTodoListDto,
  ) {
    return this.todoListsService.update(userId, id, updateTodoListDto);
  }

  @Delete(':id')
  remove(@GetCurrentUser('userId') userId: string, @Param('id') id: string) {
    return this.todoListsService.remove(userId, id);
  }

  @Post(':id/share')
  share(
    @GetCurrentUser('userId') userId: string,
    @GetCurrentUser('email') userEmail: string,
    @Param('id') id: string,
    @Body() shareListDto: ShareListDto,
  ) {
    return this.todoListsService.share(userId, userEmail, id, shareListDto);
  }

  @Get(':id/shares')
  getShares(@GetCurrentUser('userId') userId: string, @Param('id') id: string) {
    return this.todoListsService.getShares(userId, id);
  }

  @Delete(':id/share/:email')
  revokeShare(
    @GetCurrentUser('userId') userId: string,
    @Param('id') id: string,
    @Param('email') email: string,
  ) {
    return this.todoListsService.revokeShare(userId, id, email);
  }
}
