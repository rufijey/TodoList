import { Injectable } from '@nestjs/common';
import { TodosRepository } from './todos.repository';
import { TodoListsRepository } from '../todo-lists/todo-lists.repository';
import { CreateTodoDto } from './dto/create-todo.dto';
import { UpdateTodoDto } from './dto/update-todo.dto';
import {
  EntityNotFoundException,
  AccessDeniedException
} from '../shared/exceptions/domain-exceptions';

@Injectable()
export class TodosService {
  constructor(
    private todosRepository: TodosRepository,
    private todoListsRepository: TodoListsRepository,
  ) {}

  async create(userId: string, userEmail: string, dto: CreateTodoDto) {
    await this.checkWriteAccess(userId, userEmail, dto.listId);

    return this.todosRepository.create(dto.title, dto.listId);
  }

  async update(userId: string, userEmail: string, id: string, dto: UpdateTodoDto) {
    const todo = await this.todosRepository.findById(id);

    if (!todo) {
      throw new EntityNotFoundException('Todo task not found');
    }

    await this.checkWriteAccess(userId, userEmail, todo.listId);

    return this.todosRepository.update(id, dto);
  }

  async remove(userId: string, userEmail: string, id: string) {
    const todo = await this.todosRepository.findById(id);

    if (!todo) {
      throw new EntityNotFoundException('Todo task not found');
    }

    await this.checkWriteAccess(userId, userEmail, todo.listId);

    await this.todosRepository.delete(id);

    return { success: true };
  }

  private async checkWriteAccess(userId: string, userEmail: string, listId: string) {
    const list = await this.todoListsRepository.findById(listId);

    if (!list) {
      throw new EntityNotFoundException('To-Do list not found');
    }

    if (list.ownerId === userId) {
      return;
    }

    const sharedRecord = await this.todoListsRepository.findSharedRecord(listId, userEmail);

    if (!sharedRecord || sharedRecord.permission !== 'WRITE') {
      throw new AccessDeniedException('You do not have permission to modify tasks in this list');
    }
  }
}
