import { TodoStatus } from '@prisma/client';
export { TodoStatus };
export declare class UpdateTodoDto {
    title?: string;
    status?: TodoStatus;
}
