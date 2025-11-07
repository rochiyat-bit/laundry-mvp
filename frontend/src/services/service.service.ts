import api from './api';
import { Service } from '../types';

export const serviceService = {
  getAllServices: async (activeOnly = false): Promise<Service[]> => {
    const { data } = await api.get<Service[]>(
      `/services${activeOnly ? '?active=true' : ''}`
    );
    return data;
  },

  getServiceById: async (id: string): Promise<Service> => {
    const { data } = await api.get<Service>(`/services/${id}`);
    return data;
  },

  createService: async (serviceData: Partial<Service>): Promise<Service> => {
    const { data } = await api.post<Service>('/services', serviceData);
    return data;
  },

  updateService: async (
    id: string,
    serviceData: Partial<Service>
  ): Promise<Service> => {
    const { data } = await api.put<Service>(`/services/${id}`, serviceData);
    return data;
  },

  deleteService: async (id: string): Promise<void> => {
    await api.delete(`/services/${id}`);
  },
};
