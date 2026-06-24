import client from '../../../shared/api/client';

export const getTodoLists = async () => {
  return client.get('/todo-lists');
};

export const createTodoList = async (name: string) => {
  return client.post('/todo-lists', { name });
};

export const renameTodoList = async (listId: string, name: string) => {
  return client.patch(`/todo-lists/${listId}`, { name });
};

export const deleteTodoList = async (listId: string) => {
  return client.delete(`/todo-lists/${listId}`);
};

export const getTodoListShares = async (listId: string) => {
  return client.get(`/todo-lists/${listId}/shares`);
};

export const shareTodoList = async (listId: string, email: string, permission: 'READ' | 'WRITE') => {
  return client.post(`/todo-lists/${listId}/share`, { email, permission });
};

export const revokeTodoListShare = async (listId: string, email: string) => {
  return client.delete(`/todo-lists/${listId}/share/${email}`);
};
