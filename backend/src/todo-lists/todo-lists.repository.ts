import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Permission } from '@prisma/client';

@Injectable()
export class TodoListsRepository {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, name: string, slug: string) {
    return this.prisma.todoList.create({
      data: {
        name,
        slug,
        ownerId: userId,
      },
    });
  }

  async findOwnedLists(userId: string) {
    return this.prisma.todoList.findMany({
      where: { ownerId: userId },
      include: {
        todos: true,
        sharedWith: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findSharedLists(userEmail: string) {
    return this.prisma.sharedList.findMany({
      where: { sharedWithEmail: userEmail },
      include: {
        list: {
          include: {
            todos: true,
            owner: {
              select: {
                email: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(listId: string) {
    return this.prisma.todoList.findUnique({
      where: { id: listId },
      include: {
        todos: {
          orderBy: { createdAt: 'asc' },
        },
        owner: {
          select: {
            id: true,
            email: true,
          },
        },
      },
    });
  }

  async findBySlug(slug: string) {
    return this.prisma.todoList.findUnique({
      where: { slug },
      include: {
        todos: {
          orderBy: { createdAt: 'asc' },
        },
        owner: {
          select: {
            id: true,
            email: true,
          },
        },
      },
    });
  }

  async findSharedRecord(listId: string, email: string) {
    return this.prisma.sharedList.findUnique({
      where: {
        listId_sharedWithEmail: {
          listId,
          sharedWithEmail: email,
        },
      },
    });
  }

  async updateName(listId: string, name: string) {
    return this.prisma.todoList.update({
      where: { id: listId },
      data: { name },
    });
  }

  async delete(listId: string) {
    await this.prisma.todoList.delete({
      where: { id: listId },
    });
  }

  async upsertShare(listId: string, email: string, permission: Permission) {
    return this.prisma.sharedList.upsert({
      where: {
        listId_sharedWithEmail: {
          listId,
          sharedWithEmail: email,
        },
      },
      update: {
        permission,
      },
      create: {
        listId,
        sharedWithEmail: email,
        permission,
      },
    });
  }

  async findShares(listId: string) {
    return this.prisma.sharedList.findMany({
      where: { listId },
      orderBy: { createdAt: 'asc' },
    });
  }

  async deleteShare(listId: string, email: string) {
    await this.prisma.sharedList.delete({
      where: {
        listId_sharedWithEmail: {
          listId,
          sharedWithEmail: email,
        },
      },
    });
  }
}
