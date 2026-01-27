import { Filter, Plus, Search } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/stores/useAppStore";
import type { Customer, CustomerType } from "@/types";
import { CustomerRow } from "./CustomerRow";
import { EmptyState } from "@/components/shared/EmptyState";

interface CustomersListProps {
  customers: Customer[];
  customerTypes: CustomerType[];
  onView?: (id: string) => void;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onCreate?: () => void;
}

export function CustomersList({
  customers,
  customerTypes,
  onView,
  onEdit,
  onDelete,
  onCreate,
}: CustomersListProps) {
  const t = useAppStore((state) => state.t);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<CustomerType | "all">("all");
  const [sortBy, setSortBy] = useState<"name" | "date">("date");

  const filteredCustomers = customers
    .filter((customer) => {
      const matchesSearch =
        customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        customer.phone.includes(searchQuery) ||
        customer.humanId.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = typeFilter === "all" || customer.customerType === typeFilter;
      return matchesSearch && matchesType;
    })
    .sort((a, b) =>
      sortBy === "name"
        ? a.name.localeCompare(b.name)
        : new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

  const typeLabels: Record<CustomerType, string> = {
    visitor: t("visitor"),
    weekly: t("weekly"),
    "half-monthly": t("halfMonthly"),
    monthly: t("monthly"),
  };

  return (
    <div className="flex h-full flex-col space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div className="text-start">
          <h1 className="font-bold text-2xl text-stone-900 dark:text-stone-100">
            {t("customers")}
          </h1>
          <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">
            {t("totalCustomers", { count: customers.length })}
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={onCreate} size="md" variant="primary">
            <Plus className="h-4 w-4" />
            {t("newCustomer")}
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
          <input
            className="w-full rounded-lg border border-stone-200 bg-white py-2 ps-10 pe-4 text-start text-sm placeholder:text-stone-400 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 dark:border-stone-700 dark:bg-stone-900"
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t("searchCustomers")}
            type="text"
            value={searchQuery}
          />
        </div>
        <div className="relative">
          <Filter className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
          <select
            className="cursor-pointer appearance-none rounded-lg border border-stone-200 bg-white py-2 ps-10 pe-8 text-start text-sm focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 dark:border-stone-700 dark:bg-stone-900"
            onChange={(e) => setTypeFilter(e.target.value as CustomerType | "all")}
            value={typeFilter}
          >
            <option value="all">{t("allTypes")}</option>
            {customerTypes.map((type) => (
              <option key={type} value={type}>
                {typeLabels[type]}
              </option>
            ))}
          </select>
        </div>
        <select
          className="cursor-pointer appearance-none rounded-lg border border-stone-200 bg-white px-3 py-2 text-start text-sm focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 dark:border-stone-700 dark:bg-stone-900"
          onChange={(e) => setSortBy(e.target.value as "name" | "date")}
          value={sortBy}
        >
          <option value="date">{t("newestFirst")}</option>
          <option value="name">{t("nameAZ")}</option>
        </select>
      </div>

      {/* Content */}
      {filteredCustomers.length === 0 ? (
        <EmptyState
          description={t("tryAdjustingFilters")}
          icon="users"
          title={t("noCustomersFound")}
        />
      ) : (
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-stone-200 bg-white dark:border-stone-800 dark:bg-stone-900">
          {/* Table Header - Fixed */}
          <div className="hidden flex-shrink-0 grid-cols-12 gap-4 border-stone-200 border-b bg-stone-50 px-4 py-3 text-start md:grid dark:border-stone-800 dark:bg-stone-800/50">
            <div className="col-span-1 font-medium text-stone-500 text-xs uppercase dark:text-stone-400">
              {t("id")}
            </div>
            <div className="col-span-3 font-medium text-stone-500 text-xs uppercase dark:text-stone-400">
              {t("customer")}
            </div>
            <div className="col-span-2 font-medium text-stone-500 text-xs uppercase dark:text-stone-400">
              {t("phone")}
            </div>
            <div className="col-span-2 font-medium text-stone-500 text-xs uppercase dark:text-stone-400">
              {t("type")}
            </div>
            <div className="col-span-2 text-center font-medium text-stone-500 text-xs uppercase dark:text-stone-400">
              {t("balance")}
            </div>
            <div className="col-span-2 text-end font-medium text-stone-500 text-xs uppercase dark:text-stone-400">
              {t("actions")}
            </div>
          </div>

          {/* Table Body - Scrollable */}
          <div className="scrollbar-thin flex-1 overflow-y-auto">
            <div className="divide-y divide-stone-100 dark:divide-stone-800">
              {filteredCustomers.map((customer) => (
                <CustomerRow
                  customer={customer}
                  key={customer.id}
                  onDelete={() => onDelete?.(customer.id)}
                  onEdit={() => onEdit?.(customer.id)}
                  onView={() => onView?.(customer.id)}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
