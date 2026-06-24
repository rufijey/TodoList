import { TodoListsService } from './todo-lists.service';
import { CreateTodoListDto } from './dto/create-todo-list.dto';
import { ShareListDto } from './dto/share-list.dto';
export declare class TodoListsController {
    private readonly todoListsService;
    constructor(todoListsService: TodoListsService);
    create(userId: string, createTodoListDto: CreateTodoListDto): Promise<{
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
    findOne(userId: string, userEmail: string, slug: string): Promise<{
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
    update(userId: string, id: string, updateTodoListDto: CreateTodoListDto): Promise<{
        id: string;
        createdAt: Date;
        name: string;
        slug: string | null;
        ownerId: string;
    }>;
    remove(userId: string, id: string): Promise<{
        success: boolean;
    }>;
    share(userId: string, userEmail: string, id: string, shareListDto: ShareListDto): Promise<{
        id: string;
        createdAt: Date;
        listId: string;
        sharedWithEmail: string;
        permission: import(".prisma/client").$Enums.Permission;
    }>;
    getShares(userId: string, id: string): Promise<{
        id: string;
        createdAt: Date;
        listId: string;
        sharedWithEmail: string;
        permission: import(".prisma/client").$Enums.Permission;
    }[]>;
    revokeShare(userId: string, id: string, email: string): Promise<{
        success: boolean;
    }>;
}
