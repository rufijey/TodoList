import client from '../../../shared/api/client';

export const signup = async (email: string, password: string) => {
  return client.post('/users/signup', { email, password });
};

export const signin = async (email: string, password: string) => {
  return client.post('/users/signin', { email, password });
};

export const logout = async () => {
  return client.post('/users/logout');
};

export const verifyEmail = async (token: string) => {
  return client.get(`/users/verify?token=${token}`);
};
