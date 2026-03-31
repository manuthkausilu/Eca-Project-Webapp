"use client";

import { useEffect, useState } from "react";
import {
  Users,
  BookOpen,
  GraduationCap,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { customerApi, productApi, orderApi } from "@/lib/api";
import type { Product, Order } from "@/types";

interface Stats {
  customers: number;
  products: number;
  orders: number;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [customers, prods, orders] = await Promise.all([
          customerApi.getAll(),
          productApi.getAll(),
          orderApi.getAll(),
        ]);
        setStats({
          customers: customers.length,
          products: prods.length,
          orders: orders.length,
        });
        setRecentOrders(orders.slice(-5).reverse());
        setProducts(prods);
      } catch {
        // silently handle – services may not be running locally
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const statCards = [
    {
      label: "Total Customers",
      value: stats?.customers ?? 0,
      icon: Users,
      color: "text-blue-600",
      bg: "bg-blue-50",
      href: "/customers",
    },
    {
      label: "Total Products",
      value: stats?.products ?? 0,
      icon: BookOpen,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
      href: "/products",
    },
    {
      label: "Total Orders",
      value: stats?.orders ?? 0,
      icon: GraduationCap,
      color: "text-purple-600",
      bg: "bg-purple-50",
      href: "/orders",
    }
  ];

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-1 lg:grid-cols-3">
        {statCards.map(({ label, value, icon: Icon, color, bg, href }) => (
          <Link key={label} href={href}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-500">{label}</p>
                    {loading ? (
                      <Skeleton className="h-8 w-16 mt-1" />
                    ) : (
                      <p className="text-3xl font-bold text-slate-900 mt-1">
                        {value}
                      </p>
                    )}
                  </div>
                  <div className={`${bg} rounded-full p-3`}>
                    <Icon className={`h-6 w-6 ${color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Recent Orders */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-base font-semibold">
              Recent Orders
            </CardTitle>
            <Link href="/orders">
              <Button variant="ghost" size="sm" className="text-blue-600 gap-1">
                View all <ArrowRight className="h-3 w-3" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="space-y-3">
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))
            ) : recentOrders.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-4">
                No orders yet
              </p>
            ) : (
              recentOrders.map((e) => (
                <div
                  key={e.id}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div>
                    <p className="text-sm font-medium text-slate-900">
                      {e.customer?.name ?? e.customerId}
                    </p>
                    <p className="text-xs text-slate-500">
                      Product: {e.productId}
                    </p>
                  </div>
                  <div className="text-right">
                    <Badge variant="secondary" className="text-xs">
                      #{e.id}
                    </Badge>
                    <p className="text-xs text-slate-400 mt-1">{e.date}</p>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Products Overview */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-base font-semibold">
              Products Overview
            </CardTitle>
            <Link href="/products">
              <Button variant="ghost" size="sm" className="text-blue-600 gap-1">
                Manage <ArrowRight className="h-3 w-3" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="space-y-3">
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))
            ) : products.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-4">
                No products yet
              </p>
            ) : (
              products.slice(0, 5).map((p) => (
                <div
                  key={p.productId}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div>
                    <p className="text-sm font-medium text-slate-900">
                      {p.description}
                    </p>
                  </div>
                  <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
                    {p.productId}
                  </Badge>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <Link href="/customers?action=new">
              <Button
                variant="outline"
                className="w-full justify-start gap-2 h-12"
              >
                <Users className="h-4 w-4 text-blue-600" />
                Add New Customer
              </Button>
            </Link>
            <Link href="/products?action=new">
              <Button
                variant="outline"
                className="w-full justify-start gap-2 h-12"
              >
                <BookOpen className="h-4 w-4 text-emerald-600" />
                Add New Product
              </Button>
            </Link>
            <Link href="/orders?action=new">
              <Button
                variant="outline"
                className="w-full justify-start gap-2 h-12"
              >
                <GraduationCap className="h-4 w-4 text-purple-600" />
                New Order
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Footer */}
      <div className="flex flex-col items-end gap-3 pt-4 pb-2 border-t border-slate-200">
        <Image
          src="/ijse-eca.jpg"
          alt="ECA Logo"
          width={80}
          height={80}
          className="rounded-lg object-contain"
        />
        <div className="text-right space-y-1">
          <p className="text-sm font-medium text-slate-600">ECA Project</p>
          <p className="text-xs text-slate-400">
            &copy; ECA Project, POS System.
          </p>
        </div>
      </div>
    </div>
  );
}
