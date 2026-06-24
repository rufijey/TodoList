import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TodoStatus } from '@prisma/client';

@Injectable()
export class TodosRepository {
  constructor(private prisma: PrismaService) {}

  async create(title: string, listId: string) {
    return this.prisma.todo.create({
      data: {
        title,
        listId,
      },
    });
  }

  async findById(id: string) {
    return this.prisma.todo.findUnique({
      where: { id },
    });
  }

  async update(id: string, data: { title?: string; status?: TodoStatus }) {
    return this.prisma.todo.update({
      where: { id },
      data,
    });
  }

  async delete(id: string) {
    await this.prisma.todo.delete({
      where: { id },
    });
  }
}
