import axios from "axios";
import type {
  Customer,
  CustomerFormData,
  CustomerSummary,
  Product,
  ProductFormData,
  Order,
  OrderFormData,
} from "@/types";

const API_GATEWAY = process.env.NEXT_PUBLIC_API_GATEWAY_URL || "http://localhost:7000";

const api = axios.create({
  baseURL: API_GATEWAY,
  headers: { "Content-Type": "application/json" },
});

// ─── Customer API ───────────────────────────────────────────────────────────────

export const customerApi = {
  getAll: async (): Promise<Customer[]> => {
    const { data } = await api.get("/api/v1/customers");
    return data;
  },

  getById: async (nic: string): Promise<Customer> => {
    const { data } = await api.get(`/api/v1/customers/${nic}`);
    return data;
  },

  create: async (formData: CustomerFormData): Promise<Customer> => {
    const form = new FormData();
    form.append("nic", formData.nic);
    form.append("name", formData.name);
    form.append("address", formData.address);
    form.append("mobile", formData.mobile);
    if (formData.email) form.append("email", formData.email);
    if (formData.picture) form.append("picture", formData.picture);

    const { data } = await api.post("/api/v1/customers", form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  },

  update: async (nic: string, formData: CustomerFormData): Promise<Customer> => {
    const form = new FormData();
    form.append("name", formData.name);
    form.append("address", formData.address);
    form.append("mobile", formData.mobile);
    if (formData.email) form.append("email", formData.email);
    if (formData.picture) form.append("picture", formData.picture);

    const { data } = await api.put(`/api/v1/customers/${nic}`, form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  },

  delete: async (nic: string): Promise<void> => {
    await api.delete(`/api/v1/customers/${nic}`);
  },

  getPictureUrl: (nic: string): string =>
    `${API_GATEWAY}/api/v1/customers/${nic}/picture`,
};

// ─── Products API ───────────────────────────────────────────────────────────────
// Backend field names: `productId`
type ProductRaw = { productId: string; description: string };

const toProduct = (raw: ProductRaw): Product => ({
  productId: raw.productId,
  description: raw.description,
});

export const productApi = {
  getAll: async (): Promise<Product[]> => {
    const { data } = await api.get("/api/v1/products");
    return (data as ProductRaw[]).map(toProduct);
  },

  getById: async (productId: string): Promise<Product> => {
    const { data } = await api.get(`/api/v1/products/${productId}`);
    return toProduct(data as ProductRaw);
  },

  create: async (body: ProductFormData): Promise<Product> => {
    const { data } = await api.post("/api/v1/products", {
      productId: body.productId,
      description: body.description,
    });
    return toProduct(data as ProductRaw);
  },

  update: async (productId: string, body: ProductFormData): Promise<Product> => {
    const { data } = await api.put(`/api/v1/products/${productId}`, {
      productId: body.productId,
      description: body.description,
    });
    return toProduct(data as ProductRaw);
  },

  delete: async (productId: string): Promise<void> => {
    await api.delete(`/api/v1/products/${productId}`);
  },
};

// ─── Orders API ────────────────────────────────────────────────────────────────
// Backend field names: `customerId`, `productId`, and `customer`
type OrderRaw = {
  id?: number;
  date: string;
  customerId: string;
  productId: string;
  customer?: CustomerSummary;
};

const toOrder = (raw: OrderRaw): Order => ({
  id: raw.id,
  date: raw.date,
  customerId: raw.customerId,
  productId: raw.productId,
  customer: raw.customer,
});

export const orderApi = {
  getAll: async (): Promise<Order[]> => {
    const { data } = await api.get("/api/v1/orders");
    return (data as OrderRaw[]).map(toOrder);
  },

  getById: async (id: number): Promise<Order> => {
    const { data } = await api.get(`/api/v1/orders/${id}`);
    return toOrder(data as OrderRaw);
  },

  getByProduct: async (productId: string): Promise<Order[]> => {
    const { data } = await api.get("/api/v1/orders", {
      params: { productId },
    });
    return (data as OrderRaw[]).map(toOrder);
  },

  create: async (body: OrderFormData): Promise<Order> => {
    const { data } = await api.post("/api/v1/orders", {
      date: body.date,
      customerId: body.customerId,
      productId: body.productId,
    });
    return toOrder(data as OrderRaw);
  },

  update: async (id: number, body: OrderFormData): Promise<Order> => {
    const { data } = await api.put(`/api/v1/orders/${id}`, {
      date: body.date,
      customerId: body.customerId,
      productId: body.productId,
    });
    return toOrder(data as OrderRaw);
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/api/v1/orders/${id}`);
  },
};
