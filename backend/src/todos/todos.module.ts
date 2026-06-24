import { Module } from '@nestjs/common';
import { TodosService } from './todos.service';
import { TodosController } from './todos.controller';
import { TodosRepository } from './todos.repository';
import { TodoListsModule } from '../todo-lists/todo-lists.module';

@Module({
  imports: [TodoListsModule],
  controllers: [TodosController],
  providers: [TodosService, TodosRepository],
  exports: [TodosService, TodosRepository],
})
export class TodosModule {}
