import api from './api';
import { Order } from '../types';

export const orderService = {
  createOrder: async (orderData: any): Promise<Order> => {
    const { data } = await api.post<Order>('/orders', orderData);
    return data;
  },

  getAllOrders: async (): Promise<Order[]> => {
    const { data } = await api.get<Order[]>('/orders');
    return data;
  },

  getOrderById: async (id: string): Promise<Order> => {
    const { data } = await api.get<Order>(`/orders/${id}`);
    return data;
  },

  updateOrderStatus: async (
    id: string,
    status: string,
    notes?: string
  ): Promise<Order> => {
    const { data } = await api.patch<Order>(`/orders/${id}/status`, {
      status,
      notes,
    });
    return data;
  },

  deleteOrder: async (id: string): Promise<void> => {
    await api.delete(`/orders/${id}`);
  },
};
