"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { Plus, Search, Pencil, Trash2, Eye } from "lucide-react";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import { customerApi } from "@/lib/api";
import type { Customer } from "@/types";
import { CustomerForm } from "@/components/customers/customer-form";

function CustomersContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Customer | undefined>();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Customer | null>(null);
  const [viewTarget, setViewTarget] = useState<Customer | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    try {
      const data = await customerApi.getAll();
      setCustomers(data);
    } catch {
      toast.error("Failed to load customers");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  useEffect(() => {
    if (searchParams.get("action") === "new") {
      setEditTarget(undefined);
      setFormOpen(true);
    }
  }, [searchParams]);

  const filtered = customers.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.nic.toLowerCase().includes(search.toLowerCase()) ||
      s.mobile.includes(search)
  );

  const openNew = () => {
    setEditTarget(undefined);
    setFormOpen(true);
  };

  const openEdit = (customer: Customer) => {
    setEditTarget(customer);
    setFormOpen(true);
  };

  const handleFormClose = () => {
    setFormOpen(false);
    router.replace("/customers");
  };

  const handleFormSubmit = async (
    values: {
      nic: string;
      name: string;
      address: string;
      mobile: string;
      email?: string;
    },
    picture?: File
  ) => {
    setSubmitting(true);
    try {
      if (editTarget) {
        await customerApi.update(editTarget.nic, { ...values, picture });
        toast.success("Customer updated successfully");
      } else {
        await customerApi.create({ ...values, picture });
        toast.success("Customer created successfully");
      }
      handleFormClose();
      fetchCustomers();
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Operation failed";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await customerApi.delete(deleteTarget.nic);
      toast.success("Customer deleted");
      setDeleteOpen(false);
      fetchCustomers();
    } catch {
      toast.error("Failed to delete customer");
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
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              className="pl-9"
              placeholder="Search by name, NIC or mobile…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Button onClick={openNew} className="gap-2 shrink-0">
            <Plus className="h-4 w-4" />
            Add Customer
          </Button>
        </div>

        {/* Table */}
        <div className="rounded-lg border bg-white shadow-sm">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50">
                <TableHead className="w-12"></TableHead>
                  <TableHead>Customer</TableHead>
                <TableHead>NIC</TableHead>
                <TableHead>Mobile</TableHead>
                <TableHead>Email</TableHead>
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
                  <TableCell colSpan={6} className="text-center py-10 text-slate-400">
                    {search ? "No matching customers found" : "No customers yet. Add one!"}
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((customer) => (
                  <TableRow key={customer.nic} className="hover:bg-slate-50">
                    <TableCell>
                      <Avatar className="h-8 w-8">
                        <AvatarImage
                          src={customerApi.getPictureUrl(customer.nic)}
                          alt={customer.name}
                        />
                        <AvatarFallback className="bg-blue-100 text-blue-700 text-xs font-bold">
                          {initials(customer.name)}
                        </AvatarFallback>
                      </Avatar>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium text-slate-900">{customer.name}</p>
                        <p className="text-xs text-slate-400 truncate max-w-[160px]">
                          {customer.address}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="font-mono">
                        {customer.nic}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-slate-600">{customer.mobile}</TableCell>
                    <TableCell className="text-slate-500 text-sm">
                      {customer.email ?? "—"}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => setViewTarget(customer)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => openEdit(customer)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                          onClick={() => { setDeleteTarget(customer); setDeleteOpen(true); }}
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
        <p className="text-xs text-slate-400">
          {filtered.length} customer{filtered.length !== 1 ? "s" : ""} shown
        </p>
      </div>

      {/* Create / Edit Dialog */}
      <Dialog open={formOpen} onOpenChange={(open) => !open && handleFormClose()}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editTarget ? "Edit Customer" : "Add New Customer"}
            </DialogTitle>
          </DialogHeader>
          <CustomerForm
            customer={editTarget}
            onSubmit={handleFormSubmit}
            onCancel={handleFormClose}
            loading={submitting}
          />
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={!!viewTarget} onOpenChange={(open) => !open && setViewTarget(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Customer Details</DialogTitle>
          </DialogHeader>
          {viewTarget && (
            <div className="space-y-4">
              <div className="flex flex-col items-center gap-3">
                <Avatar className="h-24 w-24 border-2 border-blue-200">
                  <AvatarImage
                    src={customerApi.getPictureUrl(viewTarget.nic)}
                    alt={viewTarget.name}
                  />
                  <AvatarFallback className="bg-blue-100 text-blue-700 text-2xl font-bold">
                    {initials(viewTarget.name)}
                  </AvatarFallback>
                </Avatar>
                <h3 className="text-lg font-semibold">{viewTarget.name}</h3>
                <Badge variant="outline" className="font-mono">{viewTarget.nic}</Badge>
              </div>
              <div className="space-y-2 text-sm">
                {[
                  { label: "Mobile", value: viewTarget.mobile },
                  { label: "Email", value: viewTarget.email ?? "—" },
                  { label: "Address", value: viewTarget.address },
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between border-b pb-2">
                    <span className="text-slate-500">{label}</span>
                    <span className="font-medium text-right max-w-[180px]">{value}</span>
                  </div>
                ))}
              </div>
              <div className="flex gap-2 pt-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setViewTarget(null);
                    openEdit(viewTarget);
                  }}
                >
                  <Pencil className="mr-2 h-4 w-4" /> Edit
                </Button>
                <Button
                  variant="destructive"
                  className="flex-1"
                  onClick={() => {
                    setDeleteTarget(viewTarget);
                    setDeleteOpen(true);
                    setViewTarget(null);
                  }}
                >
                  <Trash2 className="mr-2 h-4 w-4" /> Delete
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog
        open={deleteOpen}
        onOpenChange={(open) => !open && setDeleteOpen(false)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Customer</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete{" "}
              <strong>{deleteTarget?.name}</strong> ({deleteTarget?.nic})?
              This action cannot be undone.
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

export default function CustomersPage() {
  return (
    <Suspense>
      <CustomersContent />
    </Suspense>
  );
}
