export interface Todo {
  id: string;
  title: string;
  status: 'TO_DO' | 'IN_PROGRESS' | 'COMPLETED';
  listId: string;
  createdAt: string;
}
