import api from './api';
import { User } from '../types';

export const userService = {
  getAllUsers: async (): Promise<User[]> => {
    const { data } = await api.get<User[]>('/users');
    return data;
  },

  getUserById: async (id: string): Promise<User> => {
    const { data } = await api.get<User>(`/users/${id}`);
    return data;
  },

  createUser: async (userData: any): Promise<User> => {
    const { data } = await api.post<User>('/users', userData);
    return data;
  },

  updateUser: async (id: string, userData: any): Promise<User> => {
    const { data } = await api.put<User>(`/users/${id}`, userData);
    return data;
  },

  deleteUser: async (id: string): Promise<void> => {
    await api.delete(`/users/${id}`);
  },
};
