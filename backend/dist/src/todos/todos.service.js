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
exports.TodosService = void 0;
const common_1 = require("@nestjs/common");
const todos_repository_1 = require("./todos.repository");
const todo_lists_repository_1 = require("../todo-lists/todo-lists.repository");
const domain_exceptions_1 = require("../shared/exceptions/domain-exceptions");
let TodosService = class TodosService {
    todosRepository;
    todoListsRepository;
    constructor(todosRepository, todoListsRepository) {
        this.todosRepository = todosRepository;
        this.todoListsRepository = todoListsRepository;
    }
    async create(userId, userEmail, dto) {
        await this.checkWriteAccess(userId, userEmail, dto.listId);
        return this.todosRepository.create(dto.title, dto.listId);
    }
    async update(userId, userEmail, id, dto) {
        const todo = await this.todosRepository.findById(id);
        if (!todo) {
            throw new domain_exceptions_1.EntityNotFoundException('Todo task not found');
        }
        await this.checkWriteAccess(userId, userEmail, todo.listId);
        return this.todosRepository.update(id, dto);
    }
    async remove(userId, userEmail, id) {
        const todo = await this.todosRepository.findById(id);
        if (!todo) {
            throw new domain_exceptions_1.EntityNotFoundException('Todo task not found');
        }
        await this.checkWriteAccess(userId, userEmail, todo.listId);
        await this.todosRepository.delete(id);
        return { success: true };
    }
    async checkWriteAccess(userId, userEmail, listId) {
        const list = await this.todoListsRepository.findById(listId);
        if (!list) {
            throw new domain_exceptions_1.EntityNotFoundException('To-Do list not found');
        }
        if (list.ownerId === userId) {
            return;
        }
        const sharedRecord = await this.todoListsRepository.findSharedRecord(listId, userEmail);
        if (!sharedRecord || sharedRecord.permission !== 'WRITE') {
            throw new domain_exceptions_1.AccessDeniedException('You do not have permission to modify tasks in this list');
        }
    }
};
exports.TodosService = TodosService;
exports.TodosService = TodosService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [todos_repository_1.TodosRepository,
        todo_lists_repository_1.TodoListsRepository])
], TodosService);
//# sourceMappingURL=todos.service.js.map