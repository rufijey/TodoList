"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TodoListsRepository = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let TodoListsRepository = class TodoListsRepository {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(userId, name, slug) {
        return this.prisma.todoList.create({
            data: {
                name,
                slug,
                ownerId: userId,
            },
        });
    }
    async findOwnedLists(userId) {
        return this.prisma.todoList.findMany({
            where: { ownerId: userId },
            include: {
                todos: true,
                sharedWith: true,
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    async findSharedLists(userEmail) {
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
    async findById(listId) {
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
    async findBySlug(slug) {
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
    async findSharedRecord(listId, email) {
        return this.prisma.sharedList.findUnique({
            where: {
                listId_sharedWithEmail: {
                    listId,
                    sharedWithEmail: email,
                },
            },
        });
    }
    async updateName(listId, name) {
        return this.prisma.todoList.update({
            where: { id: listId },
            data: { name },
        });
    }
    async delete(listId) {
        await this.prisma.todoList.delete({
            where: { id: listId },
        });
    }
    async upsertShare(listId, email, permission) {
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
    async findShares(listId) {
        return this.prisma.sharedList.findMany({
            where: { listId },
            orderBy: { createdAt: 'asc' },
        });
    }
    async deleteShare(listId, email) {
        await this.prisma.sharedList.delete({
            where: {
                listId_sharedWithEmail: {
                    listId,
                    sharedWithEmail: email,
                },
            },
        });
    }
};
exports.TodoListsRepository = TodoListsRepository;
exports.TodoListsRepository = TodoListsRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], TodoListsRepository);
//# sourceMappingURL=todo-lists.repository.js.map