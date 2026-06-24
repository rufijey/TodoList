import type { Todo } from '../../todo/model/types';

export interface TodoList {
  id: string;
  name: string;
  slug: string;
  role: 'OWNER' | 'SHARED';
  permission: 'READ' | 'WRITE';
  sharedBy?: string;
  todos: Todo[];
}
