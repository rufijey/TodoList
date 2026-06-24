import { TodoListsRepository } from './todo-lists.repository';
import { UsersRepository } from '../users/users.repository';
import { CreateTodoListDto } from './dto/create-todo-list.dto';
import { ShareListDto } from './dto/share-list.dto';
import { MailService } from '../mail/mail.service';
export declare class TodoListsService {
    private todoListsRepository;
    private usersRepository;
    private mailService;
    constructor(todoListsRepository: TodoListsRepository, usersRepository: UsersRepository, mailService: MailService);
    create(userId: string, dto: CreateTodoListDto): Promise<{
        id: string;
        createdAt: Date;
        name: string;
        slug: string | null;
        ownerId: string;
    }>;
    findAll(userId: string, userEmail: string): Promise<{
        owned: {
            role: string;
            permission: string;
            todos: {
                id: string;
                createdAt: Date;
                listId: string;
                title: string;
                status: import(".prisma/client").$Enums.TodoStatus;
            }[];
            sharedWith: {
                id: string;
                createdAt: Date;
                listId: string;
                sharedWithEmail: string;
                permission: import(".prisma/client").$Enums.Permission;
            }[];
            id: string;
            createdAt: Date;
            name: string;
            slug: string | null;
            ownerId: string;
        }[];
        shared: {
            role: string;
            permission: import(".prisma/client").$Enums.Permission;
            sharedBy: string;
            owner: {
                email: string;
            };
            todos: {
                id: string;
                createdAt: Date;
                listId: string;
                title: string;
                status: import(".prisma/client").$Enums.TodoStatus;
            }[];
            id: string;
            createdAt: Date;
            name: string;
            slug: string | null;
            ownerId: string;
        }[];
    }>;
    findOne(userId: string, userEmail: string, listId: string): Promise<{
        role: string;
        permission: string;
        owner: {
            id: string;
            email: string;
        };
        todos: {
            id: string;
            createdAt: Date;
            listId: string;
            title: string;
            status: import(".prisma/client").$Enums.TodoStatus;
        }[];
        id: string;
        createdAt: Date;
        name: string;
        slug: string | null;
        ownerId: string;
    } | {
        role: string;
        permission: import(".prisma/client").$Enums.Permission;
        sharedBy: string;
        owner: {
            id: string;
            email: string;
        };
        todos: {
            id: string;
            createdAt: Date;
            listId: string;
            title: string;
            status: import(".prisma/client").$Enums.TodoStatus;
        }[];
        id: string;
        createdAt: Date;
        name: string;
        slug: string | null;
        ownerId: string;
    }>;
    update(userId: string, listId: string, dto: CreateTodoListDto): Promise<{
        id: string;
        createdAt: Date;
        name: string;
        slug: string | null;
        ownerId: string;
    }>;
    remove(userId: string, listId: string): Promise<{
        success: boolean;
    }>;
    share(userId: string, userEmail: string, listId: string, dto: ShareListDto): Promise<{
        id: string;
        createdAt: Date;
        listId: string;
        sharedWithEmail: string;
        permission: import(".prisma/client").$Enums.Permission;
    }>;
    getShares(userId: string, listId: string): Promise<{
        id: string;
        createdAt: Date;
        listId: string;
        sharedWithEmail: string;
        permission: import(".prisma/client").$Enums.Permission;
    }[]>;
    revokeShare(userId: string, listId: string, email: string): Promise<{
        success: boolean;
    }>;
    findOneBySlug(userId: string, userEmail: string, slug: string): Promise<{
        role: string;
        permission: string;
        owner: {
            id: string;
            email: string;
        };
        todos: {
            id: string;
            createdAt: Date;
            listId: string;
            title: string;
            status: import(".prisma/client").$Enums.TodoStatus;
        }[];
        id: string;
        createdAt: Date;
        name: string;
        slug: string | null;
        ownerId: string;
    } | {
        role: string;
        permission: import(".prisma/client").$Enums.Permission;
        sharedBy: string;
        owner: {
            id: string;
            email: string;
        };
        todos: {
            id: string;
            createdAt: Date;
            listId: string;
            title: string;
            status: import(".prisma/client").$Enums.TodoStatus;
        }[];
        id: string;
        createdAt: Date;
        name: string;
        slug: string | null;
        ownerId: string;
    }>;
    private generateSlug;
}
