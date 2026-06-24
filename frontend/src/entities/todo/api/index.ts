import client from '../../../shared/api/client';

export const createTodo = async (listId: string, title: string) => {
  return client.post('/todos', { listId, title });
};

export const deleteTodo = async (id: string) => {
  return client.delete(`/todos/${id}`);
};

export const updateTodoStatus = async (id: string, status: 'TO_DO' | 'IN_PROGRESS' | 'COMPLETED') => {
  return client.patch(`/todos/${id}`, { status });
};
