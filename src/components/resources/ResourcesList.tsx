import { LayoutGrid, List, Plus } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/stores/useAppStore";
import type { Resource, ResourceType } from "@/types";
import { ResourceCard } from "./ResourceCard";
import { EmptyState } from "@/components/shared/EmptyState";

interface ResourcesListProps {
  resources: Resource[];
  resourceTypes: ResourceType[];
  onView?: (id: string) => void;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onCreate?: () => void;
  onSelectForSession?: (id: string) => void;
}

export function ResourcesList({ resources, resourceTypes, onView, onCreate }: ResourcesListProps) {
  const t = useAppStore((state) => state.t);
  const isRTL = useAppStore((state) => state.isRTL);
  const [typeFilter, setTypeFilter] = useState<ResourceType | "all">("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const filteredResources = resources.filter(
    (resource) => typeFilter === "all" || resource.resourceType === typeFilter
  );
  const availableCount = filteredResources.filter((r) => r.isAvailable).length;
  const occupiedCount = filteredResources.filter((r) => !r.isAvailable).length;

  const typeLabels: Record<ResourceType, string> = {
    seat: t("seat"),
    room: t("room"),
    desk: t("desk"),
  };

  return (
    <div className="flex flex-col space-y-6 p-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div className={isRTL ? "text-end" : "text-start"}>
          <h1 className="font-bold text-2xl text-stone-900 dark:text-stone-100">
            {t("resources")}
          </h1>
          <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">
            <span className="text-emerald-600 dark:text-emerald-400">
              {availableCount} {t("available")}
            </span>
            {" · "}
            <span className="text-red-600 dark:text-red-400">
              {occupiedCount} {t("occupied")}
            </span>
          </p>
        </div>
        <Button onClick={onCreate} size="md" variant="primary">
          <Plus className="h-4 w-4" />
          {t("addResource")}
        </Button>
      </div>
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div className="flex rounded-lg bg-stone-100 p-1 dark:bg-stone-800">
          <button
            className={`rounded-md px-4 py-2 font-medium text-sm transition-all ${typeFilter === "all" ? "bg-white text-stone-900 shadow-sm dark:bg-stone-700 dark:text-stone-100" : "text-stone-600 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-200"}`}
            onClick={() => setTypeFilter("all")}
            type="button"
          >
            {t("all")} ({resources.length})
          </button>
          {resourceTypes.map((type) => {
            const count = resources.filter((r) => r.resourceType === type).length;
            return (
              <button
                className={`rounded-md px-4 py-2 font-medium text-sm transition-all ${typeFilter === type ? "bg-white text-stone-900 shadow-sm dark:bg-stone-700 dark:text-stone-100" : "text-stone-600 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-200"}`}
                key={type}
                onClick={() => setTypeFilter(type)}
                type="button"
              >
                {typeLabels[type]} ({count})
              </button>
            );
          })}
        </div>
        <div className="flex rounded-lg bg-stone-100 p-1 dark:bg-stone-800">
          <button
            className={`rounded-md p-2 transition-all ${viewMode === "grid" ? "bg-white text-stone-900 shadow-sm dark:bg-stone-700 dark:text-stone-100" : "text-stone-600 dark:text-stone-400"}`}
            onClick={() => setViewMode("grid")}
            type="button"
          >
            <LayoutGrid className="h-4 w-4" />
          </button>
          <button
            className={`rounded-md p-2 transition-all ${viewMode === "list" ? "bg-white text-stone-900 shadow-sm dark:bg-stone-700 dark:text-stone-100" : "text-stone-600 dark:text-stone-400"}`}
            onClick={() => setViewMode("list")}
            type="button"
          >
            <List className="h-4 w-4" />
          </button>
        </div>
      </div>
      {filteredResources.length === 0 ? (
        <EmptyState
          description={t("addResource")}
          icon="resources"
          title={t("noResourcesFound")}
        />
      ) : typeFilter === "all" ? (
        <div className="space-y-8">
          {resourceTypes.map((type) => {
            const typeResources = filteredResources.filter((r) => r.resourceType === type);
            if (typeResources.length === 0) {
              return null;
            }

            return (
              <div className="space-y-4" key={type}>
                <div className="flex items-center gap-2 border-stone-100 border-b pb-2 dark:border-stone-800">
                  <h2 className="font-bold text-sm text-stone-900 uppercase tracking-widest dark:text-stone-100">
                    {typeLabels[type]}
                  </h2>
                  <span className="rounded-full bg-stone-100 px-2 py-0.5 font-bold text-stone-500 text-xs dark:bg-stone-800">
                    {typeResources.length}
                  </span>
                </div>
                <div className="grid 3xl:grid-cols-8 4xl:grid-cols-10 grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
                  {typeResources.map((resource) => (
                    <ResourceCard
                      key={resource.id}
                      onClick={() => onView?.(resource.id)}
                      resource={resource}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="grid 3xl:grid-cols-8 4xl:grid-cols-10 grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
          {filteredResources.map((resource) => (
            <ResourceCard
              key={resource.id}
              onClick={() => onView?.(resource.id)}
              resource={resource}
            />
          ))}
        </div>
      )}{" "}
    </div>
  );
}
