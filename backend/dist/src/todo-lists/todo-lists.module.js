"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TodoListsModule = void 0;
const common_1 = require("@nestjs/common");
const todo_lists_service_1 = require("./todo-lists.service");
const todo_lists_controller_1 = require("./todo-lists.controller");
const todo_lists_repository_1 = require("./todo-lists.repository");
const users_module_1 = require("../users/users.module");
let TodoListsModule = class TodoListsModule {
};
exports.TodoListsModule = TodoListsModule;
exports.TodoListsModule = TodoListsModule = __decorate([
    (0, common_1.Module)({
        imports: [users_module_1.UsersModule],
        controllers: [todo_lists_controller_1.TodoListsController],
        providers: [todo_lists_service_1.TodoListsService, todo_lists_repository_1.TodoListsRepository],
        exports: [todo_lists_service_1.TodoListsService, todo_lists_repository_1.TodoListsRepository],
    })
], TodoListsModule);
//# sourceMappingURL=todo-lists.module.js.map