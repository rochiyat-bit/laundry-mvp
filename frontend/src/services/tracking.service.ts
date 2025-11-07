import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export const trackingService = {
  trackOrder: async (orderNumber: string) => {
    const { data } = await axios.get(
      `${API_URL}/tracking/${orderNumber}`
    );
    return data;
  },
};
