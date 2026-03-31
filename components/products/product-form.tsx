"use client";

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
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import type { Product } from "@/types";

const schema = z.object({
  productId: z
    .string()
    .min(1, "Product ID is required")
    .regex(/^[A-Z]+$/, "Product ID must contain uppercase letters only (A-Z)"),
  description: z.string().min(1, "Description is required"),
});

export type ProductFormValues = z.infer<typeof schema>;

interface Props {
  product?: Product;
  onSubmit: (values: ProductFormValues) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

export function ProductForm({ product, onSubmit, onCancel, loading }: Props) {
  const form = useForm<ProductFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      productId: product?.productId ?? "",
      description: product?.description ?? "",
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
            name="productId"
          render={({ field }) => (
            <FormItem>
                <FormLabel>Product ID *</FormLabel>
              <FormControl>
                <Input
                  placeholder="product_id"
                  {...field}
                    disabled={!!product}
                    className={product ? "bg-slate-50 uppercase" : "uppercase"}
                  onChange={(e) =>
                    field.onChange(e.target.value.toUpperCase())
                  }
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description *</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="description"
                  rows={3}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {product ? "Update Product" : "Create Product"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
