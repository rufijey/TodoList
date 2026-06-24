import { Injectable } from '@nestjs/common';
import { TodoListsRepository } from './todo-lists.repository';
import { UsersRepository } from '../users/users.repository';
import { CreateTodoListDto } from './dto/create-todo-list.dto';
import { ShareListDto } from './dto/share-list.dto';
import { MailService } from '../mail/mail.service';
import {
  EntityNotFoundException,
  AccessDeniedException,
  ValidationException
} from '../shared/exceptions/domain-exceptions';
import slugify from 'slugify';

@Injectable()
export class TodoListsService {
  constructor(
    private todoListsRepository: TodoListsRepository,
    private usersRepository: UsersRepository,
    private mailService: MailService,
  ) {}

  async create(userId: string, dto: CreateTodoListDto) {
    const slug = this.generateSlug(dto.name);
    return this.todoListsRepository.create(userId, dto.name, slug);
  }

  async findAll(userId: string, userEmail: string) {
    const ownedLists = await this.todoListsRepository.findOwnedLists(userId);
    const sharedLists = await this.todoListsRepository.findSharedLists(userEmail);

    return {
      owned: ownedLists.map(list => ({
        ...list,
        role: 'OWNER',
        permission: 'WRITE',
      })),
      shared: sharedLists.map(shared => ({
        ...shared.list,
        role: 'SHARED',
        permission: shared.permission,
        sharedBy: shared.list.owner.email,
      })),
    };
  }

  async findOne(userId: string, userEmail: string, listId: string) {
    const list = await this.todoListsRepository.findById(listId);

    if (!list) {
      throw new EntityNotFoundException('To-Do list not found');
    }

    if (list.ownerId === userId) {
      return {
        ...list,
        role: 'OWNER',
        permission: 'WRITE',
      };
    }

    const sharedRecord = await this.todoListsRepository.findSharedRecord(listId, userEmail);

    if (!sharedRecord) {
      throw new AccessDeniedException('You do not have access to this list');
    }

    return {
      ...list,
      role: 'SHARED',
      permission: sharedRecord.permission,
      sharedBy: list.owner.email,
    };
  }

  async update(userId: string, listId: string, dto: CreateTodoListDto) {
    const list = await this.todoListsRepository.findById(listId);

    if (!list) {
      throw new EntityNotFoundException('To-Do list not found');
    }

    if (list.ownerId !== userId) {
      throw new AccessDeniedException('Only the owner can rename the list');
    }

    return this.todoListsRepository.updateName(listId, dto.name);
  }

  async remove(userId: string, listId: string) {
    const list = await this.todoListsRepository.findById(listId);

    if (!list) {
      throw new EntityNotFoundException('To-Do list not found');
    }

    if (list.ownerId !== userId) {
      throw new AccessDeniedException('Only the owner can delete the list');
    }

    await this.todoListsRepository.delete(listId);

    return { success: true };
  }

  async share(userId: string, userEmail: string, listId: string, dto: ShareListDto) {
    const list = await this.todoListsRepository.findById(listId);

    if (!list) {
      throw new EntityNotFoundException('To-Do list not found');
    }

    if (list.ownerId !== userId) {
      throw new AccessDeniedException('Only the owner can share the list');
    }

    if (dto.email.toLowerCase() === userEmail.toLowerCase()) {
      throw new ValidationException('You cannot share a list with yourself');
    }

    const targetUser = await this.usersRepository.findByEmail(dto.email.toLowerCase());

    if (!targetUser) {
      throw new EntityNotFoundException('User with this email is not registered in the system');
    }

    const shareRecord = await this.todoListsRepository.upsertShare(
      listId,
      dto.email.toLowerCase(),
      dto.permission,
    );

    await this.mailService.sendShareNotification(
      dto.email.toLowerCase(),
      list.name,
      list.owner.email,
      dto.permission,
      list.slug || undefined,
    );

    return shareRecord;
  }

  async getShares(userId: string, listId: string) {
    const list = await this.todoListsRepository.findById(listId);

    if (!list) {
      throw new EntityNotFoundException('To-Do list not found');
    }

    if (list.ownerId !== userId) {
      throw new AccessDeniedException('Only the owner can view share settings');
    }

    return this.todoListsRepository.findShares(listId);
  }

  async revokeShare(userId: string, listId: string, email: string) {
    const list = await this.todoListsRepository.findById(listId);

    if (!list) {
      throw new EntityNotFoundException('To-Do list not found');
    }

    if (list.ownerId !== userId) {
      throw new AccessDeniedException('Only the owner can revoke access');
    }

    await this.todoListsRepository.deleteShare(listId, email);

    return { success: true };
  }

  async findOneBySlug(userId: string, userEmail: string, slug: string) {
    const list = await this.todoListsRepository.findBySlug(slug);

    if (!list) {
      throw new EntityNotFoundException('To-Do list not found');
    }

    if (list.ownerId === userId) {
      return {
        ...list,
        role: 'OWNER',
        permission: 'WRITE',
      };
    }

    const sharedRecord = await this.todoListsRepository.findSharedRecord(list.id, userEmail);

    if (!sharedRecord) {
      throw new AccessDeniedException('You do not have access to this list');
    }

    return {
      ...list,
      role: 'SHARED',
      permission: sharedRecord.permission,
      sharedBy: list.owner.email,
    };
  }

  private generateSlug(name: string): string {
    const slugified = slugify(name, {
      lower: true,
      strict: true,
      trim: true,
    });

    const randomSuffix = Math.random().toString(36).substring(2, 8);
    return `${slugified || 'list'}-${randomSuffix}`;
  }
}
