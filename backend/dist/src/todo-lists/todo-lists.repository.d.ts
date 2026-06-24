import { PrismaService } from '../prisma/prisma.service';
import { Permission } from '@prisma/client';
export declare class TodoListsRepository {
    private prisma;
    constructor(prisma: PrismaService);
    create(userId: string, name: string, slug: string): Promise<{
        id: string;
        createdAt: Date;
        name: string;
        slug: string | null;
        ownerId: string;
    }>;
    findOwnedLists(userId: string): Promise<({
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
    } & {
        id: string;
        createdAt: Date;
        name: string;
        slug: string | null;
        ownerId: string;
    })[]>;
    findSharedLists(userEmail: string): Promise<({
        list: {
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
        } & {
            id: string;
            createdAt: Date;
            name: string;
            slug: string | null;
            ownerId: string;
        };
    } & {
        id: string;
        createdAt: Date;
        listId: string;
        sharedWithEmail: string;
        permission: import(".prisma/client").$Enums.Permission;
    })[]>;
    findById(listId: string): Promise<({
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
    } & {
        id: string;
        createdAt: Date;
        name: string;
        slug: string | null;
        ownerId: string;
    }) | null>;
    findBySlug(slug: string): Promise<({
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
    } & {
        id: string;
        createdAt: Date;
        name: string;
        slug: string | null;
        ownerId: string;
    }) | null>;
    findSharedRecord(listId: string, email: string): Promise<{
        id: string;
        createdAt: Date;
        listId: string;
        sharedWithEmail: string;
        permission: import(".prisma/client").$Enums.Permission;
    } | null>;
    updateName(listId: string, name: string): Promise<{
        id: string;
        createdAt: Date;
        name: string;
        slug: string | null;
        ownerId: string;
    }>;
    delete(listId: string): Promise<void>;
    upsertShare(listId: string, email: string, permission: Permission): Promise<{
        id: string;
        createdAt: Date;
        listId: string;
        sharedWithEmail: string;
        permission: import(".prisma/client").$Enums.Permission;
    }>;
    findShares(listId: string): Promise<{
        id: string;
        createdAt: Date;
        listId: string;
        sharedWithEmail: string;
        permission: import(".prisma/client").$Enums.Permission;
    }[]>;
    deleteShare(listId: string, email: string): Promise<void>;
}
