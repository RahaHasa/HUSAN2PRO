const API_URL = 'http://localhost:3000/api';

class ApiClient {
  private getToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('token');
    }
    return null;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = this.getToken();
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }

    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      const text = await response.text();
      return text ? JSON.parse(text) : null;
    }
    
    return null;
  }

  // Auth
  async register(data: { email: string; password: string; firstName: string; lastName: string; phone?: string }) {
    return this.request<{ access_token: string; user: any }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async login(data: { email: string; password: string }) {
    return this.request<{ access_token: string; user: any }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async logout() {
    return this.request('/auth/logout', { method: 'POST' });
  }

  async getMe() {
    return this.request<any>('/auth/me');
  }

  // Products
  async getProducts() {
    return this.request<any[]>('/products');
  }

  async getProduct(id: number) {
    return this.request<any>(`/products/${id}`);
  }

  async createProduct(data: any) {
    return this.request<any>('/products', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateProduct(id: number, data: any) {
    return this.request<any>(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteProduct(id: number) {
    return this.request(`/products/${id}`, { method: 'DELETE' });
  }

  // Categories
  async getCategories() {
    return this.request<any[]>('/categories');
  }

  async getCategory(id: number) {
    return this.request<any>(`/categories/${id}`);
  }

  async createCategory(data: any) {
    return this.request<any>('/categories', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateCategory(id: number, data: any) {
    return this.request<any>(`/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteCategory(id: number) {
    return this.request(`/categories/${id}`, { method: 'DELETE' });
  }

  // Rentals
  async getRentals() {
    return this.request<any[]>('/rentals');
  }

  async getRental(id: number) {
    return this.request<any>(`/rentals/${id}`);
  }

  async createRental(data: any) {
    return this.request<any>('/rentals', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateRental(id: number, data: any) {
    return this.request<any>(`/rentals/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteRental(id: number) {
    return this.request(`/rentals/${id}`, { method: 'DELETE' });
  }

  // Orders
  async getOrders() {
    return this.request<any[]>('/orders');
  }

  async getOrder(id: number) {
    return this.request<any>(`/orders/${id}`);
  }

  async createOrder(data: any) {
    return this.request<any>('/orders', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateOrder(id: number, data: any) {
    return this.request<any>(`/orders/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteOrder(id: number) {
    return this.request(`/orders/${id}`, { method: 'DELETE' });
  }

  // Discounts
  async getDiscounts() {
    return this.request<any[]>('/discounts');
  }

  async getDiscount(id: number) {
    return this.request<any>(`/discounts/${id}`);
  }

  async getDiscountByCode(code: string) {
    return this.request<any>(`/discounts/code/${code}`);
  }

  async createDiscount(data: any) {
    return this.request<any>('/discounts', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateDiscount(id: number, data: any) {
    return this.request<any>(`/discounts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteDiscount(id: number) {
    return this.request(`/discounts/${id}`, { method: 'DELETE' });
  }
}

export const api = new ApiClient();
