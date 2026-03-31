"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { Plus, Search, Pencil, Trash2, Filter } from "lucide-react";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import { orderApi, productApi, customerApi } from "@/lib/api";
import type { Order, Product } from "@/types";
import {
  OrderForm,
  type OrderFormValues,
} from "@/components/orders/order-form";

function OrdersContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [productFilter, setProductFilter] = useState("all");
  const [formOpen, setFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Order | undefined>();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Order | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [ord, prods] = await Promise.all([
        orderApi.getAll(),
        productApi.getAll(),
      ]);
      setOrders(ord);
      setProducts(prods);
    } catch {
      toast.error("Failed to load orders");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (searchParams.get("action") === "new") {
      setEditTarget(undefined);
      setFormOpen(true);
    }
  }, [searchParams]);

  const filtered = orders.filter((e) => {
    const matchesSearch =
      (e.customer?.name ?? e.customerId)
        .toLowerCase()
        .includes(search.toLowerCase()) ||
      e.customerId.toLowerCase().includes(search.toLowerCase()) ||
      e.productId.toLowerCase().includes(search.toLowerCase());
    const matchesProduct =
      productFilter === "all" || e.productId === productFilter;
    return matchesSearch && matchesProduct;
  });

  const openNew = () => {
    setEditTarget(undefined);
    setFormOpen(true);
  };

  const openEdit = (order: Order) => {
    setEditTarget(order);
    setFormOpen(true);
  };

  const handleFormClose = () => {
    setFormOpen(false);
    router.replace("/orders");
  };

  const handleFormSubmit = async (values: OrderFormValues) => {
    setSubmitting(true);
    try {
      if (editTarget?.id) {
        await orderApi.update(editTarget.id, values);
        toast.success("Order updated successfully");
      } else {
        await orderApi.create(values);
        toast.success("Order created successfully");
      }
      handleFormClose();
      fetchData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Operation failed";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget?.id) return;
    try {
      await orderApi.delete(deleteTarget.id);
      toast.success("Order deleted");
      setDeleteOpen(false);
      fetchData();
    } catch {
      toast.error("Failed to delete order");
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      return format(new Date(dateStr), "MMM d, yyyy");
    } catch {
      return dateStr;
    }
  };

  const initials = (name: string) =>
    name
      .split(" ")
      .map((w) => w[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);

  return (
    <>
      <div className="space-y-4">
        {/* Toolbar */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                className="pl-9"
                placeholder="Search customer or product…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-slate-400 shrink-0" />
              <Select value={productFilter} onValueChange={setProductFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="All Products" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Products</SelectItem>
                  {products.map((p) => (
                    <SelectItem key={p.productId} value={p.productId}>
                      {p.productId} – {p.description}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button onClick={openNew} className="gap-2 shrink-0">
            <Plus className="h-4 w-4" />
            New Order
          </Button>
        </div>

        {/* Stats row */}
        <div className="flex items-center gap-4 text-sm text-slate-500">
          <span>
            <strong className="text-slate-900">{filtered.length}</strong> order
            {filtered.length !== 1 ? "s" : ""}
          </span>
          {productFilter !== "all" && (
            <Badge
              variant="secondary"
              className="cursor-pointer"
              onClick={() => setProductFilter("all")}
            >
              Product: {productFilter} ×
            </Badge>
          )}
        </div>

        {/* Table */}
        <div className="rounded-lg border bg-white shadow-sm">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50">
                <TableHead className="w-10">#</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>NIC</TableHead>
                <TableHead>Product</TableHead>
                <TableHead>Order Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 6 }).map((__, j) => (
                      <TableCell key={j}>
                        <Skeleton className="h-5 w-full" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : filtered.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center py-10 text-slate-400"
                  >
                    {search || productFilter !== "all"
                      ? "No matching orders"
                      : "No orders yet. Create one!"}
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((e) => (
                  <TableRow key={e.id} className="hover:bg-slate-50">
                    <TableCell className="text-slate-400 text-xs font-mono">
                      {e.id}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-7 w-7">
                          <AvatarImage
                            src={customerApi.getPictureUrl(e.customerId)}
                          />
                          <AvatarFallback className="bg-blue-100 text-blue-700 text-xs font-bold">
                            {initials(e.customer?.name ?? e.customerId)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium text-slate-900">
                          {e.customer?.name ?? e.customerId}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="font-mono text-xs">
                        {e.customerId}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
                        {e.productId}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-slate-600">
                      {formatDate(e.date)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => openEdit(e)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                          onClick={() => { setDeleteTarget(e); setDeleteOpen(true); }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Create / Edit Dialog */}
      <Dialog open={formOpen} onOpenChange={(open) => !open && handleFormClose()}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editTarget ? "Edit Order" : "New Order"}
            </DialogTitle>
          </DialogHeader>
          <OrderForm
            order={editTarget}
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
            <AlertDialogTitle>Delete Order</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete order{" "}
              <strong>#{deleteTarget?.id}</strong> for{" "}
              <strong>{deleteTarget?.customer?.name ?? deleteTarget?.customerId}</strong>{" "}
              in product <strong>{deleteTarget?.productId}</strong>? This action cannot be undone.
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

export default function OrdersPage() {
  return (
    <Suspense>
      <OrdersContent />
    </Suspense>
  );
}
