import { PrismaService } from '../prisma/prisma.service';
import { TodoStatus } from '@prisma/client';
export declare class TodosRepository {
    private prisma;
    constructor(prisma: PrismaService);
    create(title: string, listId: string): Promise<{
        id: string;
        createdAt: Date;
        listId: string;
        title: string;
        status: import(".prisma/client").$Enums.TodoStatus;
    }>;
    findById(id: string): Promise<{
        id: string;
        createdAt: Date;
        listId: string;
        title: string;
        status: import(".prisma/client").$Enums.TodoStatus;
    } | null>;
    update(id: string, data: {
        title?: string;
        status?: TodoStatus;
    }): Promise<{
        id: string;
        createdAt: Date;
        listId: string;
        title: string;
        status: import(".prisma/client").$Enums.TodoStatus;
    }>;
    delete(id: string): Promise<void>;
}
