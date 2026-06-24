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
exports.TodoListsService = void 0;
const common_1 = require("@nestjs/common");
const todo_lists_repository_1 = require("./todo-lists.repository");
const users_repository_1 = require("../users/users.repository");
const mail_service_1 = require("../mail/mail.service");
const domain_exceptions_1 = require("../shared/exceptions/domain-exceptions");
const slugify_1 = require("slugify");
let TodoListsService = class TodoListsService {
    todoListsRepository;
    usersRepository;
    mailService;
    constructor(todoListsRepository, usersRepository, mailService) {
        this.todoListsRepository = todoListsRepository;
        this.usersRepository = usersRepository;
        this.mailService = mailService;
    }
    async create(userId, dto) {
        const slug = this.generateSlug(dto.name);
        return this.todoListsRepository.create(userId, dto.name, slug);
    }
    async findAll(userId, userEmail) {
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
    async findOne(userId, userEmail, listId) {
        const list = await this.todoListsRepository.findById(listId);
        if (!list) {
            throw new domain_exceptions_1.EntityNotFoundException('To-Do list not found');
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
            throw new domain_exceptions_1.AccessDeniedException('You do not have access to this list');
        }
        return {
            ...list,
            role: 'SHARED',
            permission: sharedRecord.permission,
            sharedBy: list.owner.email,
        };
    }
    async update(userId, listId, dto) {
        const list = await this.todoListsRepository.findById(listId);
        if (!list) {
            throw new domain_exceptions_1.EntityNotFoundException('To-Do list not found');
        }
        if (list.ownerId !== userId) {
            throw new domain_exceptions_1.AccessDeniedException('Only the owner can rename the list');
        }
        return this.todoListsRepository.updateName(listId, dto.name);
    }
    async remove(userId, listId) {
        const list = await this.todoListsRepository.findById(listId);
        if (!list) {
            throw new domain_exceptions_1.EntityNotFoundException('To-Do list not found');
        }
        if (list.ownerId !== userId) {
            throw new domain_exceptions_1.AccessDeniedException('Only the owner can delete the list');
        }
        await this.todoListsRepository.delete(listId);
        return { success: true };
    }
    async share(userId, userEmail, listId, dto) {
        const list = await this.todoListsRepository.findById(listId);
        if (!list) {
            throw new domain_exceptions_1.EntityNotFoundException('To-Do list not found');
        }
        if (list.ownerId !== userId) {
            throw new domain_exceptions_1.AccessDeniedException('Only the owner can share the list');
        }
        if (dto.email.toLowerCase() === userEmail.toLowerCase()) {
            throw new domain_exceptions_1.ValidationException('You cannot share a list with yourself');
        }
        const targetUser = await this.usersRepository.findByEmail(dto.email.toLowerCase());
        if (!targetUser) {
            throw new domain_exceptions_1.EntityNotFoundException('User with this email is not registered in the system');
        }
        const shareRecord = await this.todoListsRepository.upsertShare(listId, dto.email.toLowerCase(), dto.permission);
        await this.mailService.sendShareNotification(dto.email.toLowerCase(), list.name, list.owner.email, dto.permission, list.slug || undefined);
        return shareRecord;
    }
    async getShares(userId, listId) {
        const list = await this.todoListsRepository.findById(listId);
        if (!list) {
            throw new domain_exceptions_1.EntityNotFoundException('To-Do list not found');
        }
        if (list.ownerId !== userId) {
            throw new domain_exceptions_1.AccessDeniedException('Only the owner can view share settings');
        }
        return this.todoListsRepository.findShares(listId);
    }
    async revokeShare(userId, listId, email) {
        const list = await this.todoListsRepository.findById(listId);
        if (!list) {
            throw new domain_exceptions_1.EntityNotFoundException('To-Do list not found');
        }
        if (list.ownerId !== userId) {
            throw new domain_exceptions_1.AccessDeniedException('Only the owner can revoke access');
        }
        await this.todoListsRepository.deleteShare(listId, email);
        return { success: true };
    }
    async findOneBySlug(userId, userEmail, slug) {
        const list = await this.todoListsRepository.findBySlug(slug);
        if (!list) {
            throw new domain_exceptions_1.EntityNotFoundException('To-Do list not found');
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
            throw new domain_exceptions_1.AccessDeniedException('You do not have access to this list');
        }
        return {
            ...list,
            role: 'SHARED',
            permission: sharedRecord.permission,
            sharedBy: list.owner.email,
        };
    }
    generateSlug(name) {
        const slugified = (0, slugify_1.default)(name, {
            lower: true,
            strict: true,
            trim: true,
        });
        const randomSuffix = Math.random().toString(36).substring(2, 8);
        return `${slugified || 'list'}-${randomSuffix}`;
    }
};
exports.TodoListsService = TodoListsService;
exports.TodoListsService = TodoListsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [todo_lists_repository_1.TodoListsRepository,
        users_repository_1.UsersRepository,
        mail_service_1.MailService])
], TodoListsService);
//# sourceMappingURL=todo-lists.service.js.map