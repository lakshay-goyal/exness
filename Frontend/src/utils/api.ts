import axios from 'axios';

// Create axios instance with default config
const api = axios.create({
  baseURL: 'http://localhost:3000',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token is invalid, clear storage and redirect to signin
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/signin';
    }
    return Promise.reject(error);
  }
);

// Order API functions
export const orderAPI = {
  // Create a new order
  createOrder: (orderData: {
    symbol: string;
    type: string;
    quantity: number;
    leverage: number;
  }) => api.post('/order/trade', orderData),

  // Get open orders
  getOpenOrders: () => api.get('/order/open'),

  // Get closed orders
  getClosedOrders: () => api.get('/order/close'),

  // Close an order
  closeOrder: (orderId: string) => api.post('/order/close', { orderId }),
};

export default api;
