import { sql } from "drizzle-orm";
import {
  check,
  index,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";

export const spaceStatusEnum = pgEnum("space_status", [
  "available",
  "occupied",
  "reserved",
  "cleaning",
  "maintenance",
  "blocked",
  "inactive",
]);

export const branch = pgTable(
  "branch",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    timezone: text("timezone").default("Africa/Cairo").notNull(),
    currency: text("currency").default("EGP").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [uniqueIndex("branch_name_idx").on(table.name)],
);

export const floor = pgTable(
  "floor",
  {
    id: text("id").primaryKey(),
    branchId: text("branch_id")
      .notNull()
      .references(() => branch.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    sortOrder: integer("sort_order").default(0).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [
    index("floor_branch_id_idx").on(table.branchId),
    check("floor_non_negative_sort_order_check", sql`${table.sortOrder} >= 0`),
  ],
);

export const space = pgTable(
  "space",
  {
    id: text("id").primaryKey(),
    branchId: text("branch_id")
      .notNull()
      .references(() => branch.id, { onDelete: "cascade" }),
    floorId: text("floor_id").references(() => floor.id, { onDelete: "set null" }),
    name: text("name").notNull(),
    kind: text("kind").notNull(),
    capacity: integer("capacity").default(1).notNull(),
    status: spaceStatusEnum("status").default("available").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [
    index("space_branch_id_idx").on(table.branchId),
    index("space_floor_id_idx").on(table.floorId),
    index("space_status_idx").on(table.status),
    check("space_positive_capacity_check", sql`${table.capacity} > 0`),
  ],
);

export const spaceStatusHistory = pgTable(
  "space_status_history",
  {
    id: text("id").primaryKey(),
    spaceId: text("space_id")
      .notNull()
      .references(() => space.id, { onDelete: "cascade" }),
    fromStatus: spaceStatusEnum("from_status"),
    toStatus: spaceStatusEnum("to_status").notNull(),
    reason: text("reason"),
    changedAt: timestamp("changed_at").defaultNow().notNull(),
    changedByUserId: text("changed_by_user_id"),
  },
  (table) => [index("space_status_history_space_id_idx").on(table.spaceId)],
);
