import { Test, TestingModule } from '@nestjs/testing';
import { TodoListsService } from './todo-lists.service';
import { TodoListsRepository } from './todo-lists.repository';
import { UsersRepository } from '../users/users.repository';
import { MailService } from '../mail/mail.service';
import {
  EntityNotFoundException,
  AccessDeniedException,
  ValidationException
} from '../shared/exceptions/domain-exceptions';

describe('TodoListsService', () => {
  let service: TodoListsService;
  let todoListsRepository: TodoListsRepository;
  let usersRepository: UsersRepository;
  let mailService: MailService;

  const mockList = {
    id: 'list-1',
    name: 'Test List',
    ownerId: 'owner-uuid',
    slug: 'test-list',
    owner: { email: 'owner@example.com' },
    todos: [],
    createdAt: new Date(),
  };

  const mockSharedRecord = {
    id: 'share-1',
    listId: 'list-1',
    sharedWithEmail: 'shared@example.com',
    permission: 'READ' as const,
    createdAt: new Date(),
    list: {
      id: 'list-1',
      name: 'Test List',
      ownerId: 'owner-uuid',
      slug: 'test-list',
      owner: { email: 'owner@example.com' },
      todos: [],
    },
  };

  const mockUser = {
    id: 'user-uuid',
    email: 'target@example.com',
  };

  const mockTodoListsRepository = {
    create: jest.fn(),
    findOwnedLists: jest.fn(),
    findSharedLists: jest.fn(),
    findById: jest.fn(),
    findBySlug: jest.fn(),
    findSharedRecord: jest.fn(),
    updateName: jest.fn(),
    delete: jest.fn(),
    upsertShare: jest.fn(),
    findShares: jest.fn(),
    deleteShare: jest.fn(),
  };

  const mockUsersRepository = {
    findByEmail: jest.fn(),
  };

  const mockMailService = {
    sendShareNotification: jest.fn().mockResolvedValue(undefined),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TodoListsService,
        { provide: TodoListsRepository, useValue: mockTodoListsRepository },
        { provide: UsersRepository, useValue: mockUsersRepository },
        { provide: MailService, useValue: mockMailService },
      ],
    }).compile();

    service = module.get<TodoListsService>(TodoListsService);
    todoListsRepository = module.get<TodoListsRepository>(TodoListsRepository);
    usersRepository = module.get<UsersRepository>(UsersRepository);
    mailService = module.get<MailService>(MailService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create list and return it', async () => {
      mockTodoListsRepository.create.mockResolvedValue(mockList);

      const result = await service.create('owner-uuid', { name: 'New List' });

      expect(mockTodoListsRepository.create).toHaveBeenCalled();
      expect(result).toEqual(mockList);
    });
  });

  describe('findAll', () => {
    it('should return owned and shared lists formatted correctly', async () => {
      mockTodoListsRepository.findOwnedLists.mockResolvedValue([mockList]);
      mockTodoListsRepository.findSharedLists.mockResolvedValue([mockSharedRecord]);

      const result = await service.findAll('owner-uuid', 'owner@example.com');

      expect(mockTodoListsRepository.findOwnedLists).toHaveBeenCalledWith('owner-uuid');
      expect(mockTodoListsRepository.findSharedLists).toHaveBeenCalledWith('owner@example.com');
      expect(result.owned[0].role).toBe('OWNER');
      expect(result.shared[0].role).toBe('SHARED');
      expect(result.shared[0].sharedBy).toBe('owner@example.com');
    });
  });

  describe('findOne', () => {
    it('should throw EntityNotFoundException if list does not exist', async () => {
      mockTodoListsRepository.findById.mockResolvedValue(null);

      await expect(
        service.findOne('user-uuid', 'user@example.com', 'list-99'),
      ).rejects.toThrow(EntityNotFoundException);
    });

    it('should return list as OWNER if user is the owner', async () => {
      mockTodoListsRepository.findById.mockResolvedValue(mockList);

      const result = await service.findOne('owner-uuid', 'owner@example.com', 'list-1');

      expect(result.role).toBe('OWNER');
      expect(result.permission).toBe('WRITE');
    });

    it('should return list as SHARED if user is in share list', async () => {
      mockTodoListsRepository.findById.mockResolvedValue(mockList);
      mockTodoListsRepository.findSharedRecord.mockResolvedValue(mockSharedRecord);

      const result = await service.findOne('guest-uuid', 'shared@example.com', 'list-1');

      expect(result.role).toBe('SHARED');
      expect(result.permission).toBe('READ');
    });

    it('should throw AccessDeniedException if user has no access', async () => {
      mockTodoListsRepository.findById.mockResolvedValue(mockList);
      mockTodoListsRepository.findSharedRecord.mockResolvedValue(null);

      await expect(
        service.findOne('guest-uuid', 'outsider@example.com', 'list-1'),
      ).rejects.toThrow(AccessDeniedException);
    });
  });

  describe('update', () => {
    it('should update name if user is the owner', async () => {
      mockTodoListsRepository.findById.mockResolvedValue(mockList);
      mockTodoListsRepository.updateName.mockResolvedValue({
        ...mockList,
        name: 'New Name',
      });

      const result = await service.update('owner-uuid', 'list-1', { name: 'New Name' });

      expect(mockTodoListsRepository.updateName).toHaveBeenCalledWith('list-1', 'New Name');
      expect(result.name).toBe('New Name');
    });

    it('should throw AccessDeniedException if user is not the owner', async () => {
      mockTodoListsRepository.findById.mockResolvedValue(mockList);

      await expect(
        service.update('guest-uuid', 'list-1', { name: 'New Name' }),
      ).rejects.toThrow(AccessDeniedException);
    });
  });

  describe('remove', () => {
    it('should delete list if user is the owner', async () => {
      mockTodoListsRepository.findById.mockResolvedValue(mockList);
      mockTodoListsRepository.delete.mockResolvedValue(undefined);

      const result = await service.remove('owner-uuid', 'list-1');

      expect(mockTodoListsRepository.delete).toHaveBeenCalledWith('list-1');
      expect(result).toEqual({ success: true });
    });

    it('should throw AccessDeniedException if user is not the owner', async () => {
      mockTodoListsRepository.findById.mockResolvedValue(mockList);

      await expect(
        service.remove('guest-uuid', 'list-1'),
      ).rejects.toThrow(AccessDeniedException);
    });
  });

  describe('share', () => {
    it('should share and send notification if inputs are valid', async () => {
      mockTodoListsRepository.findById.mockResolvedValue(mockList);
      mockUsersRepository.findByEmail.mockResolvedValue(mockUser);
      mockTodoListsRepository.upsertShare.mockResolvedValue(mockSharedRecord);

      const result = await service.share('owner-uuid', 'owner@example.com', 'list-1', {
        email: 'target@example.com',
        permission: 'READ',
      });

      expect(mockTodoListsRepository.upsertShare).toHaveBeenCalledWith('list-1', 'target@example.com', 'READ');
      expect(mockMailService.sendShareNotification).toHaveBeenCalled();
      expect(result).toEqual(mockSharedRecord);
    });

    it('should throw ValidationException if user shares with themselves', async () => {
      mockTodoListsRepository.findById.mockResolvedValue(mockList);

      await expect(
        service.share('owner-uuid', 'owner@example.com', 'list-1', {
          email: 'owner@example.com',
          permission: 'READ',
        }),
      ).rejects.toThrow(ValidationException);
    });

    it('should throw EntityNotFoundException if target user is not registered', async () => {
      mockTodoListsRepository.findById.mockResolvedValue(mockList);
      mockUsersRepository.findByEmail.mockResolvedValue(null);

      await expect(
        service.share('owner-uuid', 'owner@example.com', 'list-1', {
          email: 'unregistered@example.com',
          permission: 'READ',
        }),
      ).rejects.toThrow(EntityNotFoundException);
    });
  });

  describe('findOneBySlug', () => {
    it('should return list if owner by slug', async () => {
      mockTodoListsRepository.findBySlug.mockResolvedValue(mockList);

      const result = await service.findOneBySlug('owner-uuid', 'owner@example.com', 'test-list');

      expect(mockTodoListsRepository.findBySlug).toHaveBeenCalledWith('test-list');
      expect(result.role).toBe('OWNER');
    });
  });
});
