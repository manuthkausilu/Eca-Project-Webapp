// Customer types
export interface Customer {
  nic: string;
  name: string;
  address: string;
  mobile: string;
  email?: string;
  picture?: string;
}

export interface CustomerFormData {
  nic: string;
  name: string;
  address: string;
  mobile: string;
  email?: string;
  picture?: File | null;
}

// Product types
export interface Product {
  productId: string;
  description: string;
}

export interface ProductFormData {
  productId: string;
  description: string;
}

// Order types
export interface CustomerSummary {
  name: string;
  address: string;
  mobile: string;
  email?: string;
  picture?: string;
}

export interface Order {
  id?: number;
  date: string;
  customerId: string;
  productId: string;
  customer?: CustomerSummary;
}

export interface OrderFormData {
  date: string;
  customerId: string;
  productId: string;
}

// API response wrapper
export interface ApiError {
  message: string;
  status?: number;
}
