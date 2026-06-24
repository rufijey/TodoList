import { Module } from '@nestjs/common';
import { TodoListsService } from './todo-lists.service';
import { TodoListsController } from './todo-lists.controller';
import { TodoListsRepository } from './todo-lists.repository';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [UsersModule],
  controllers: [TodoListsController],
  providers: [TodoListsService, TodoListsRepository],
  exports: [TodoListsService, TodoListsRepository],
})
export class TodoListsModule {}
