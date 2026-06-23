import { index, pgTable, primaryKey, text, timestamp, uniqueIndex } from "drizzle-orm/pg-core";

import { user } from "./auth";
import { branch } from "./workspace";

export const role = pgTable(
  "role",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    description: text("description"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [uniqueIndex("role_name_idx").on(table.name)],
);

export const permission = pgTable(
  "permission",
  {
    id: text("id").primaryKey(),
    key: text("key").notNull(),
    description: text("description"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [uniqueIndex("permission_key_idx").on(table.key)],
);

export const rolePermission = pgTable(
  "role_permission",
  {
    roleId: text("role_id")
      .notNull()
      .references(() => role.id, { onDelete: "cascade" }),
    permissionId: text("permission_id")
      .notNull()
      .references(() => permission.id, { onDelete: "cascade" }),
  },
  (table) => [primaryKey({ columns: [table.roleId, table.permissionId] })],
);

export const staffProfile = pgTable(
  "staff_profile",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    roleId: text("role_id")
      .notNull()
      .references(() => role.id, { onDelete: "restrict" }),
    displayName: text("display_name").notNull(),
    status: text("status").default("active").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [
    uniqueIndex("staff_profile_user_id_idx").on(table.userId),
    index("staff_profile_role_id_idx").on(table.roleId),
  ],
);

export const staffBranchAccess = pgTable(
  "staff_branch_access",
  {
    staffProfileId: text("staff_profile_id")
      .notNull()
      .references(() => staffProfile.id, { onDelete: "cascade" }),
    branchId: text("branch_id")
      .notNull()
      .references(() => branch.id, { onDelete: "cascade" }),
  },
  (table) => [primaryKey({ columns: [table.staffProfileId, table.branchId] })],
);
