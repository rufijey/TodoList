import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { TodoListWidget } from './TodoListWidget';
import type { TodoList } from '../../../entities/todo-list/model/types';

vi.mock('../../../entities/todo/api', () => ({}));
vi.mock('../../../entities/todo-list/api', () => ({}));
vi.mock('../../../features/todo-list/ui/ShareModal', () => ({
  ShareModal: () => null,
}));

const mockActiveList: TodoList = {
  id: 'list-1',
  name: 'My Special List',
  slug: 'my-special-list',
  role: 'OWNER',
  permission: 'WRITE',
  todos: [
    {
      id: 'todo-1',
      title: 'Task One',
      status: 'TO_DO',
      listId: 'list-1',
      createdAt: '2026-06-25T00:00:00Z',
    },
    {
      id: 'todo-2',
      title: 'Task Two',
      status: 'COMPLETED',
      listId: 'list-1',
      createdAt: '2026-06-25T00:00:00Z',
    },
  ],
};

const mockOnRefresh = vi.fn();

describe('TodoListWidget Component', () => {
  it('renders list title and task cards', () => {
    render(
      <TodoListWidget activeList={mockActiveList} onRefresh={mockOnRefresh} />
    );

    expect(screen.getByRole('heading', { name: 'My Special List' })).toBeInTheDocument();
    expect(screen.getByText('Task One')).toBeInTheDocument();
    expect(screen.getByText('Task Two')).toBeInTheDocument();
  });

  it('renders completion progress accurately', () => {
    render(
      <TodoListWidget activeList={mockActiveList} onRefresh={mockOnRefresh} />
    );

    expect(screen.getByText('Completion Progress')).toBeInTheDocument();
    expect(screen.getByText('1 of 2 (50%)')).toBeInTheDocument();
  });
});
