import { sql } from "drizzle-orm";
import { check, index, integer, pgEnum, pgTable, text, timestamp } from "drizzle-orm/pg-core";

import { person } from "./people";
import { space } from "./workspace";

export const bookingStatusEnum = pgEnum("booking_status", [
  "draft",
  "confirmed",
  "checked_in",
  "cancelled",
  "no_show",
  "completed",
]);

export const booking = pgTable(
  "booking",
  {
    id: text("id").primaryKey(),
    personId: text("person_id")
      .notNull()
      .references(() => person.id, { onDelete: "restrict" }),
    spaceId: text("space_id").references(() => space.id, { onDelete: "set null" }),
    status: bookingStatusEnum("status").default("confirmed").notNull(),
    startsAt: timestamp("starts_at").notNull(),
    endsAt: timestamp("ends_at").notNull(),
    depositCents: integer("deposit_cents").default(0).notNull(),
    currency: text("currency").default("EGP").notNull(),
    notes: text("notes"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [
    index("booking_person_id_idx").on(table.personId),
    index("booking_space_id_idx").on(table.spaceId),
    index("booking_time_range_idx").on(table.startsAt, table.endsAt),
    check("booking_non_negative_deposit_check", sql`${table.depositCents} >= 0`),
  ],
);
