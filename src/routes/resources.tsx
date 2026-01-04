import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SearchInput } from "@/components/ui/search-input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, MapPin, Filter, CheckCircle, XCircle, Armchair } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { ResourceForm } from "@/components/customers/resource-form";
import { ResourceActions } from "@/components/customers/resource-actions";
import { PageHeader } from "@/components/shared/page-header";
import { LoadingState } from "@/components/shared/loading-state";
import { EmptyState } from "@/components/shared/empty-state";
import { StatCard } from "@/components/stat-card";
import { useResources } from "@/hooks/use-resources";
import { formatDate } from "@/lib/formatters";

export const Route = createFileRoute("/resources")({
  component: ResourcesPage,
});

export default function ResourcesPage() {
  const { language, dir, lang } = useI18n();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | "seat" | "desk" | "room">("all");

  const { data: resources, isLoading, error } = useResources();

  const filteredResources = resources?.filter((r) => {
    const matchesSearch =
      searchQuery.trim() === "" || r.name.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesType = typeFilter === "all" || r.resourceType === typeFilter;

    return matchesSearch && matchesType;
  });

  const stats = {
    total: resources?.length ?? 0,
    available: resources?.filter((r) => r.isAvailable).length ?? 0,
    inUse: resources?.filter((r) => !r.isAvailable).length ?? 0,
    seats: resources?.filter((r) => r.resourceType === "seat").length ?? 0,
  };

  return (
    <div className="container mx-auto p-8 space-y-8" dir={dir}>
      <PageHeader
        title={lang("الموارد", "Resources")}
        subtitle={lang("إدارة المقاعد والمكاتب والغرف", "Manage seats, desks and rooms")}
        action={
          <Button onClick={() => setShowCreateForm(true)}>
            <Plus className="h-4 w-4" />
            {lang("إضافة مورد", "Add Resource")}
          </Button>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title={lang("إجمالي الموارد", "Total Resources")}
          value={stats.total}
          icon={MapPin}
          color="blue"
        />
        <StatCard
          title={lang("متاح", "Available")}
          value={stats.available}
          icon={CheckCircle}
          color="emerald"
        />
        <StatCard
          title={lang("قيد الاستخدام", "In Use")}
          value={stats.inUse}
          icon={XCircle}
          color="orange"
        />
        <StatCard
          title={lang("مقاعد", "Seats")}
          value={stats.seats}
          icon={Armchair}
          color="purple"
        />
      </div>

      <Card>
        <CardHeader className="border-b">
          <div className="flex items-center gap-3 justify-between w-full">
            <CardTitle>{lang("جميع الموارد", "All Resources")}</CardTitle>

            <div className="flex gap-3">
              <SearchInput
                placeholder={lang("بحث بالاسم...", "Search by name...")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-[320px]"
              />

              <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v as any)}>
                <SelectTrigger className="w-[140px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{lang("الكل", "All")}</SelectItem>
                  <SelectItem value="seat">{lang("مقعد", "Seat")}</SelectItem>
                  <SelectItem value="desk">{lang("مكتب", "Desk")}</SelectItem>
                  <SelectItem value="room">{lang("غرفة", "Room")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {isLoading ? (
            <LoadingState type="table" count={5} />
          ) : error ? (
            <EmptyState icon={MapPin} title={lang("خطأ في تحميل البيانات", "Error loading data")} />
          ) : !filteredResources?.length ? (
            <EmptyState
              icon={MapPin}
              title={lang("لم يتم العثور على موارد", "No resources found")}
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className={dir === "rtl" ? "text-right" : "text-left"}>
                    {lang("الاسم", "Name")}
                  </TableHead>
                  <TableHead className={dir === "rtl" ? "text-right" : "text-left"}>
                    {lang("النوع", "Type")}
                  </TableHead>
                  <TableHead className={dir === "rtl" ? "text-right" : "text-left"}>
                    {lang("الحالة", "Status")}
                  </TableHead>
                  <TableHead className={dir === "rtl" ? "text-right" : "text-left"}>
                    {lang("تاريخ الإنشاء", "Created")}
                  </TableHead>
                  <TableHead className={dir === "rtl" ? "text-right" : "text-right"} />
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredResources.map((resource) => (
                  <TableRow key={resource.id}>
                    <TableCell className={dir === "rtl" ? "text-right" : "text-left"}>
                      <div className="flex items-center gap-3">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{resource.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className={dir === "rtl" ? "text-right" : "text-left"}>
                      <Badge variant="outline">
                        {getResourceTypeLabel(resource.resourceType, language)}
                      </Badge>
                    </TableCell>
                    <TableCell className={dir === "rtl" ? "text-right" : "text-left"}>
                      <Badge variant={resource.isAvailable ? "default" : "secondary"}>
                        {resource.isAvailable
                          ? lang("متاح", "Available")
                          : lang("قيد الاستخدام", "In Use")}
                      </Badge>
                    </TableCell>
                    <TableCell className={dir === "rtl" ? "text-right" : "text-left"}>
                      {formatDate(resource.createdAt, language)}
                    </TableCell>
                    <TableCell className={dir === "rtl" ? "text-right" : "text-right"}>
                      <ResourceActions resource={resource} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <ResourceForm open={showCreateForm} onOpenChange={setShowCreateForm} mode="create" />
    </div>
  );
}

function getResourceTypeLabel(type: string, language: string): string {
  const labels: Record<string, { ar: string; en: string }> = {
    seat: { ar: "مقعد", en: "Seat" },
    desk: { ar: "مكتب", en: "Desk" },
    room: { ar: "غرفة", en: "Room" },
  };

  return labels[type]?.[language as "ar" | "en"] || type;
}
