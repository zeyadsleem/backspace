import { index, pgEnum, pgTable, text, timestamp } from "drizzle-orm/pg-core";

import { user } from "./auth";
import { branch, space } from "./workspace";

export const shiftStatusEnum = pgEnum("shift_status", ["open", "closed", "cancelled"]);

export const taskStatusEnum = pgEnum("task_status", ["open", "in_progress", "done", "cancelled"]);

export const maintenanceSeverityEnum = pgEnum("maintenance_severity", [
  "low",
  "medium",
  "high",
  "blocking",
]);

export const shift = pgTable(
  "shift",
  {
    id: text("id").primaryKey(),
    branchId: text("branch_id")
      .notNull()
      .references(() => branch.id, { onDelete: "restrict" }),
    openedByUserId: text("opened_by_user_id")
      .notNull()
      .references(() => user.id, { onDelete: "restrict" }),
    closedByUserId: text("closed_by_user_id").references(() => user.id, { onDelete: "set null" }),
    status: shiftStatusEnum("status").default("open").notNull(),
    openedAt: timestamp("opened_at").defaultNow().notNull(),
    closedAt: timestamp("closed_at"),
    expectedCashCents: text("expected_cash_cents").default("0").notNull(),
    actualCashCents: text("actual_cash_cents"),
    currency: text("currency").default("EGP").notNull(),
    notes: text("notes"),
  },
  (table) => [index("shift_branch_status_idx").on(table.branchId, table.status)],
);

export const cleaningTask = pgTable(
  "cleaning_task",
  {
    id: text("id").primaryKey(),
    spaceId: text("space_id")
      .notNull()
      .references(() => space.id, { onDelete: "cascade" }),
    status: taskStatusEnum("status").default("open").notNull(),
    reason: text("reason"),
    assignedToUserId: text("assigned_to_user_id").references(() => user.id, {
      onDelete: "set null",
    }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    completedAt: timestamp("completed_at"),
  },
  (table) => [index("cleaning_task_space_status_idx").on(table.spaceId, table.status)],
);

export const maintenanceTicket = pgTable(
  "maintenance_ticket",
  {
    id: text("id").primaryKey(),
    spaceId: text("space_id").references(() => space.id, { onDelete: "set null" }),
    status: taskStatusEnum("status").default("open").notNull(),
    severity: maintenanceSeverityEnum("severity").default("medium").notNull(),
    title: text("title").notNull(),
    description: text("description"),
    assignedToUserId: text("assigned_to_user_id").references(() => user.id, {
      onDelete: "set null",
    }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    resolvedAt: timestamp("resolved_at"),
  },
  (table) => [index("maintenance_ticket_space_status_idx").on(table.spaceId, table.status)],
);
