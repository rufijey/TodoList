import { TodosRepository } from './todos.repository';
import { TodoListsRepository } from '../todo-lists/todo-lists.repository';
import { CreateTodoDto } from './dto/create-todo.dto';
import { UpdateTodoDto } from './dto/update-todo.dto';
export declare class TodosService {
    private todosRepository;
    private todoListsRepository;
    constructor(todosRepository: TodosRepository, todoListsRepository: TodoListsRepository);
    create(userId: string, userEmail: string, dto: CreateTodoDto): Promise<{
        id: string;
        createdAt: Date;
        listId: string;
        title: string;
        status: import(".prisma/client").$Enums.TodoStatus;
    }>;
    update(userId: string, userEmail: string, id: string, dto: UpdateTodoDto): Promise<{
        id: string;
        createdAt: Date;
        listId: string;
        title: string;
        status: import(".prisma/client").$Enums.TodoStatus;
    }>;
    remove(userId: string, userEmail: string, id: string): Promise<{
        success: boolean;
    }>;
    private checkWriteAccess;
}
