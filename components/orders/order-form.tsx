"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { customerApi, productApi } from "@/lib/api";
import type { Customer, Order, Product } from "@/types";

const schema = z.object({
  customerId: z.string().min(1, "Customer is required"),
  productId: z.string().min(1, "Product is required"),
  date: z.string().min(1, "Date is required"),
});

export type OrderFormValues = z.infer<typeof schema>;

interface Props {
  order?: Order;
  onSubmit: (values: OrderFormValues) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

export function OrderForm({ order, onSubmit, onCancel, loading }: Props) {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    Promise.all([customerApi.getAll(), productApi.getAll()])
      .then(([c, p]) => {
        setCustomers(c);
        setProducts(p);
      })
      .finally(() => setFetching(false));
  }, []);

  const form = useForm<OrderFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      customerId: order?.customerId ?? "",
      productId: order?.productId ?? "",
      date: order?.date ?? new Date().toISOString().split("T")[0],
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="customerId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Customer *</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
                disabled={fetching}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue
                      placeholder={fetching ? "Loading…" : "Select a customer"}
                    />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {customers.map((c) => (
                    <SelectItem key={c.nic} value={c.nic}>
                      {c.name}{" "}
                      <span className="text-slate-400 text-xs">({c.nic})</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="productId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Product *</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
                disabled={fetching}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue
                      placeholder={fetching ? "Loading…" : "Select a product"}
                    />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {products.map((p) => (
                    <SelectItem key={p.productId} value={p.productId}>
                      {p.productId} – {p.description}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="date"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Order Date *</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading || fetching}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {order ? "Update Order" : "Create Order"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
