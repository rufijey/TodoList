import { Test, TestingModule } from '@nestjs/testing';
import { TodosService } from './todos.service';
import { TodosRepository } from './todos.repository';
import { TodoListsRepository } from '../todo-lists/todo-lists.repository';
import { EntityNotFoundException, AccessDeniedException } from '../shared/exceptions/domain-exceptions';

describe('TodosService', () => {
  let service: TodosService;
  let todosRepository: TodosRepository;
  let todoListsRepository: TodoListsRepository;

  const mockTodo = {
    id: 'todo-1',
    title: 'Test Task',
    status: 'TO_DO',
    listId: 'list-1',
    createdAt: new Date(),
  };

  const mockList = {
    id: 'list-1',
    name: 'Test List',
    ownerId: 'owner-uuid',
    slug: 'test-list',
    createdAt: new Date(),
  };

  const mockSharedRecord = {
    id: 'share-1',
    listId: 'list-1',
    sharedWithEmail: 'shared@example.com',
    permission: 'WRITE',
    createdAt: new Date(),
  };

  const mockTodosRepository = {
    create: jest.fn(),
    findById: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  const mockTodoListsRepository = {
    findById: jest.fn(),
    findSharedRecord: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TodosService,
        { provide: TodosRepository, useValue: mockTodosRepository },
        { provide: TodoListsRepository, useValue: mockTodoListsRepository },
      ],
    }).compile();

    service = module.get<TodosService>(TodosService);
    todosRepository = module.get<TodosRepository>(TodosRepository);
    todoListsRepository = module.get<TodoListsRepository>(TodoListsRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create todo if user is the owner of the list', async () => {
      mockTodoListsRepository.findById.mockResolvedValue(mockList);
      mockTodosRepository.create.mockResolvedValue(mockTodo);

      const result = await service.create('owner-uuid', 'owner@example.com', {
        title: 'New Task',
        listId: 'list-1',
      });

      expect(mockTodoListsRepository.findById).toHaveBeenCalledWith('list-1');
      expect(mockTodosRepository.create).toHaveBeenCalledWith('New Task', 'list-1');
      expect(result).toEqual(mockTodo);
    });

    it('should create todo if user has shared WRITE access', async () => {
      mockTodoListsRepository.findById.mockResolvedValue(mockList);
      mockTodoListsRepository.findSharedRecord.mockResolvedValue(mockSharedRecord);
      mockTodosRepository.create.mockResolvedValue(mockTodo);

      const result = await service.create('shared-uuid', 'shared@example.com', {
        title: 'New Task',
        listId: 'list-1',
      });

      expect(mockTodoListsRepository.findById).toHaveBeenCalledWith('list-1');
      expect(mockTodoListsRepository.findSharedRecord).toHaveBeenCalledWith('list-1', 'shared@example.com');
      expect(mockTodosRepository.create).toHaveBeenCalledWith('New Task', 'list-1');
      expect(result).toEqual(mockTodo);
    });

    it('should throw AccessDeniedException if user has only READ access', async () => {
      mockTodoListsRepository.findById.mockResolvedValue(mockList);
      mockTodoListsRepository.findSharedRecord.mockResolvedValue({
        ...mockSharedRecord,
        permission: 'READ',
      });

      await expect(
        service.create('shared-uuid', 'shared@example.com', {
          title: 'New Task',
          listId: 'list-1',
        }),
      ).rejects.toThrow(AccessDeniedException);
    });

    it('should throw EntityNotFoundException if list does not exist', async () => {
      mockTodoListsRepository.findById.mockResolvedValue(null);

      await expect(
        service.create('owner-uuid', 'owner@example.com', {
          title: 'New Task',
          listId: 'list-99',
        }),
      ).rejects.toThrow(EntityNotFoundException);
    });
  });

  describe('update', () => {
    it('should update todo if user has write access', async () => {
      mockTodosRepository.findById.mockResolvedValue(mockTodo);
      mockTodoListsRepository.findById.mockResolvedValue(mockList);
      mockTodosRepository.update.mockResolvedValue({
        ...mockTodo,
        status: 'IN_PROGRESS',
      });

      const result = await service.update('owner-uuid', 'owner@example.com', 'todo-1', {
        status: 'IN_PROGRESS',
      });

      expect(mockTodosRepository.findById).toHaveBeenCalledWith('todo-1');
      expect(mockTodosRepository.update).toHaveBeenCalledWith('todo-1', { status: 'IN_PROGRESS' });
      expect(result.status).toBe('IN_PROGRESS');
    });

    it('should throw EntityNotFoundException if todo task does not exist', async () => {
      mockTodosRepository.findById.mockResolvedValue(null);

      await expect(
        service.update('owner-uuid', 'owner@example.com', 'todo-99', {
          status: 'IN_PROGRESS',
        }),
      ).rejects.toThrow(EntityNotFoundException);
    });
  });

  describe('remove', () => {
    it('should delete todo if user has write access', async () => {
      mockTodosRepository.findById.mockResolvedValue(mockTodo);
      mockTodoListsRepository.findById.mockResolvedValue(mockList);
      mockTodosRepository.delete.mockResolvedValue(undefined);

      const result = await service.remove('owner-uuid', 'owner@example.com', 'todo-1');

      expect(mockTodosRepository.findById).toHaveBeenCalledWith('todo-1');
      expect(mockTodosRepository.delete).toHaveBeenCalledWith('todo-1');
      expect(result).toEqual({ success: true });
    });

    it('should throw EntityNotFoundException if todo task does not exist', async () => {
      mockTodosRepository.findById.mockResolvedValue(null);

      await expect(
        service.remove('owner-uuid', 'owner@example.com', 'todo-99'),
      ).rejects.toThrow(EntityNotFoundException);
    });
  });
});
