import axios from "axios";

const api = axios.create({
  baseURL: "http://genai-usecases-dev.internal.taureau.ai:8000",
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem("token");
      window.location.href = "/signin";
    }
    return Promise.reject(error);
  }
);

// Auth APIs
export const authAPI = {
  login: (data) =>
    api.post("/v1/auth/login", data, {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    }),
  // Add more auth related APIs here
};

// User APIs
export const userAPI = {
  getProfile: () => api.get("/v1/users/me"),
  // Add more user related APIs here
};

// Transactions API
export const transactionsAPI = {
  getTransactions: (params) => api.get("/v1/transactions/", { params }),
  getTransaction: (id) => api.get(`/v1/transactions/${id}`),
  createTransaction: (data) => api.post("/v1/transactions/", data),
  updateTransaction: (id, data) => api.put(`/v1/transactions/${id}`, data),
  deleteTransaction: (id) => api.delete(`/v1/transactions/${id}`),
  calculateDebts: () => api.post("/v1/debt-calculations/calculate"),
};

// You can add more API categories here
// Example:
// export const transactionAPI = { ... }

export default api;
