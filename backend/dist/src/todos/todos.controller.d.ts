import { TodosService } from './todos.service';
import { CreateTodoDto } from './dto/create-todo.dto';
import { UpdateTodoDto } from './dto/update-todo.dto';
export declare class TodosController {
    private readonly todosService;
    constructor(todosService: TodosService);
    create(userId: string, userEmail: string, createTodoDto: CreateTodoDto): Promise<{
        id: string;
        createdAt: Date;
        listId: string;
        title: string;
        status: import(".prisma/client").$Enums.TodoStatus;
    }>;
    update(userId: string, userEmail: string, id: string, updateTodoDto: UpdateTodoDto): Promise<{
        id: string;
        createdAt: Date;
        listId: string;
        title: string;
        status: import(".prisma/client").$Enums.TodoStatus;
    }>;
    remove(userId: string, userEmail: string, id: string): Promise<{
        success: boolean;
    }>;
}
