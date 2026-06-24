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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TodoListsController = void 0;
const common_1 = require("@nestjs/common");
const todo_lists_service_1 = require("./todo-lists.service");
const create_todo_list_dto_1 = require("./dto/create-todo-list.dto");
const share_list_dto_1 = require("./dto/share-list.dto");
const at_guard_1 = require("../users/guards/at.guard");
const get_current_user_decorator_1 = require("../users/decorators/get-current-user.decorator");
let TodoListsController = class TodoListsController {
    todoListsService;
    constructor(todoListsService) {
        this.todoListsService = todoListsService;
    }
    create(userId, createTodoListDto) {
        return this.todoListsService.create(userId, createTodoListDto);
    }
    findAll(userId, userEmail) {
        return this.todoListsService.findAll(userId, userEmail);
    }
    findOne(userId, userEmail, slug) {
        return this.todoListsService.findOneBySlug(userId, userEmail, slug);
    }
    update(userId, id, updateTodoListDto) {
        return this.todoListsService.update(userId, id, updateTodoListDto);
    }
    remove(userId, id) {
        return this.todoListsService.remove(userId, id);
    }
    share(userId, userEmail, id, shareListDto) {
        return this.todoListsService.share(userId, userEmail, id, shareListDto);
    }
    getShares(userId, id) {
        return this.todoListsService.getShares(userId, id);
    }
    revokeShare(userId, id, email) {
        return this.todoListsService.revokeShare(userId, id, email);
    }
};
exports.TodoListsController = TodoListsController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, get_current_user_decorator_1.GetCurrentUser)('userId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, create_todo_list_dto_1.CreateTodoListDto]),
    __metadata("design:returntype", void 0)
], TodoListsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, get_current_user_decorator_1.GetCurrentUser)('userId')),
    __param(1, (0, get_current_user_decorator_1.GetCurrentUser)('email')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], TodoListsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':slug'),
    __param(0, (0, get_current_user_decorator_1.GetCurrentUser)('userId')),
    __param(1, (0, get_current_user_decorator_1.GetCurrentUser)('email')),
    __param(2, (0, common_1.Param)('slug')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", void 0)
], TodoListsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, get_current_user_decorator_1.GetCurrentUser)('userId')),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, create_todo_list_dto_1.CreateTodoListDto]),
    __metadata("design:returntype", void 0)
], TodoListsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, get_current_user_decorator_1.GetCurrentUser)('userId')),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], TodoListsController.prototype, "remove", null);
__decorate([
    (0, common_1.Post)(':id/share'),
    __param(0, (0, get_current_user_decorator_1.GetCurrentUser)('userId')),
    __param(1, (0, get_current_user_decorator_1.GetCurrentUser)('email')),
    __param(2, (0, common_1.Param)('id')),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, share_list_dto_1.ShareListDto]),
    __metadata("design:returntype", void 0)
], TodoListsController.prototype, "share", null);
__decorate([
    (0, common_1.Get)(':id/shares'),
    __param(0, (0, get_current_user_decorator_1.GetCurrentUser)('userId')),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], TodoListsController.prototype, "getShares", null);
__decorate([
    (0, common_1.Delete)(':id/share/:email'),
    __param(0, (0, get_current_user_decorator_1.GetCurrentUser)('userId')),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Param)('email')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", void 0)
], TodoListsController.prototype, "revokeShare", null);
exports.TodoListsController = TodoListsController = __decorate([
    (0, common_1.UseGuards)(at_guard_1.AtGuard),
    (0, common_1.Controller)('todo-lists'),
    __metadata("design:paramtypes", [todo_lists_service_1.TodoListsService])
], TodoListsController);
//# sourceMappingURL=todo-lists.controller.js.map