import { index, pgTable, text, timestamp, uniqueIndex } from "drizzle-orm/pg-core";

import { branch } from "./workspace";

export const person = pgTable(
  "person",
  {
    id: text("id").primaryKey(),
    displayName: text("display_name").notNull(),
    phone: text("phone"),
    email: text("email"),
    notes: text("notes"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [
    uniqueIndex("person_phone_idx").on(table.phone),
    index("person_email_idx").on(table.email),
  ],
);

export const customerAccount = pgTable(
  "customer_account",
  {
    id: text("id").primaryKey(),
    branchId: text("branch_id").references(() => branch.id, { onDelete: "set null" }),
    name: text("name").notNull(),
    accountType: text("account_type").default("individual").notNull(),
    billingEmail: text("billing_email"),
    billingPhone: text("billing_phone"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [index("customer_account_branch_id_idx").on(table.branchId)],
);

export const tenant = pgTable(
  "tenant",
  {
    id: text("id").primaryKey(),
    accountId: text("account_id")
      .notNull()
      .references(() => customerAccount.id, { onDelete: "cascade" }),
    branchId: text("branch_id")
      .notNull()
      .references(() => branch.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    status: text("status").default("active").notNull(),
    guestPolicy: text("guest_policy"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [
    index("tenant_account_id_idx").on(table.accountId),
    index("tenant_branch_id_idx").on(table.branchId),
  ],
);
