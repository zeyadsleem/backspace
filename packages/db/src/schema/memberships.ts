import { sql } from "drizzle-orm";
import { check, index, integer, pgTable, text, timestamp } from "drizzle-orm/pg-core";

import { person } from "./people";
import { branch } from "./workspace";

export const membershipPlan = pgTable(
  "membership_plan",
  {
    id: text("id").primaryKey(),
    branchId: text("branch_id").references(() => branch.id, { onDelete: "set null" }),
    name: text("name").notNull(),
    includedMinutes: integer("included_minutes"),
    priceCents: integer("price_cents").default(0).notNull(),
    currency: text("currency").default("EGP").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [
    index("membership_plan_branch_id_idx").on(table.branchId),
    check(
      "membership_plan_non_negative_included_minutes_check",
      sql`${table.includedMinutes} is null or ${table.includedMinutes} >= 0`,
    ),
    check("membership_plan_non_negative_price_check", sql`${table.priceCents} >= 0`),
  ],
);

export const membership = pgTable(
  "membership",
  {
    id: text("id").primaryKey(),
    personId: text("person_id")
      .notNull()
      .references(() => person.id, { onDelete: "cascade" }),
    planId: text("plan_id")
      .notNull()
      .references(() => membershipPlan.id, { onDelete: "restrict" }),
    status: text("status").default("active").notNull(),
    startsAt: timestamp("starts_at").notNull(),
    endsAt: timestamp("ends_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [
    index("membership_person_id_idx").on(table.personId),
    index("membership_plan_id_idx").on(table.planId),
  ],
);
