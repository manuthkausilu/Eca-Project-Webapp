"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { Plus, Search, Pencil, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import { productApi } from "@/lib/api";
import type { Product } from "@/types";
import { ProductForm, type ProductFormValues } from "@/components/products/product-form";

function ProductsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Product | undefined>();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const data = await productApi.getAll();
      setProducts(data);
    } catch {
      toast.error("Failed to load products");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    if (searchParams.get("action") === "new") {
      setEditTarget(undefined);
      setFormOpen(true);
    }
  }, [searchParams]);

  const filtered = products.filter(
    (p) =>
      p.productId.toLowerCase().includes(search.toLowerCase()) ||
      p.description.toLowerCase().includes(search.toLowerCase())
  );

  const openNew = () => {
    setEditTarget(undefined);
    setFormOpen(true);
  };

  const openEdit = (product: Product) => {
    setEditTarget(product);
    setFormOpen(true);
  };

  const handleFormClose = () => {
    setFormOpen(false);
    router.replace("/products");
  };

  const handleFormSubmit = async (values: ProductFormValues) => {
    setSubmitting(true);
    try {
      if (editTarget) {
        await productApi.update(editTarget.productId, values);
        toast.success("Product updated successfully");
      } else {
        await productApi.create(values);
        toast.success("Product created successfully");
      }
      handleFormClose();
      fetchProducts();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Operation failed";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await productApi.delete(deleteTarget.productId);
      toast.success("Product deleted");
      setDeleteOpen(false);
      fetchProducts();
    } catch {
      toast.error("Failed to delete product");
    }
  };

  return (
    <>
      <div className="space-y-4">
        {/* Toolbar */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              className="pl-9"
              placeholder="Search by ID or description…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Button onClick={openNew} className="gap-2 shrink-0">
            <Plus className="h-4 w-4" />
            Add Product
          </Button>
        </div>

        {/* Table view for many products */}
        {!loading && filtered.length > 0 && (
          <div className="rounded-lg border bg-white shadow-sm mt-2">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50">
                  <TableHead>Product ID</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((p) => (
                  <TableRow key={p.productId}>
                    <TableCell>
                      <Badge variant="outline" className="font-mono">
                        {p.productId}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-slate-600">{p.description}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => openEdit(p)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                          onClick={() => { setDeleteTarget(p); setDeleteOpen(true); }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        <p className="text-xs text-slate-400">
          {filtered.length} product{filtered.length !== 1 ? "s" : ""} shown
        </p>
      </div>

      {/* Create / Edit Dialog */}
      <Dialog open={formOpen} onOpenChange={(open) => !open && handleFormClose()}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editTarget ? "Edit Product" : "Add New Product"}
            </DialogTitle>
          </DialogHeader>
          <ProductForm
            product={editTarget}
            onSubmit={handleFormSubmit}
            onCancel={handleFormClose}
            loading={submitting}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog
        open={deleteOpen}
        onOpenChange={(open) => !open && setDeleteOpen(false)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Product</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete product{" "}
              <strong>{deleteTarget?.productId}</strong> —{" "}
              {deleteTarget?.description}? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={handleDelete}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

export default function ProductsPage() {
  return (
    <Suspense>
      <ProductsContent />
    </Suspense>
  );
}
