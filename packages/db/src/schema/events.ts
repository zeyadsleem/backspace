import { index, pgEnum, pgTable, text, timestamp } from "drizzle-orm/pg-core";

import { visit } from "./visits";
import { customerAccount, person } from "./people";
import { branch, space } from "./workspace";

export const eventStatusEnum = pgEnum("event_status", [
  "draft",
  "confirmed",
  "in_progress",
  "completed",
  "cancelled",
]);

export const eventAttendeeStatusEnum = pgEnum("event_attendee_status", [
  "invited",
  "checked_in",
  "no_show",
  "cancelled",
]);

export const workspaceEvent = pgTable(
  "event",
  {
    id: text("id").primaryKey(),
    branchId: text("branch_id")
      .notNull()
      .references(() => branch.id, { onDelete: "restrict" }),
    hostAccountId: text("host_account_id").references(() => customerAccount.id, {
      onDelete: "set null",
    }),
    spaceId: text("space_id").references(() => space.id, { onDelete: "set null" }),
    name: text("name").notNull(),
    status: eventStatusEnum("status").default("draft").notNull(),
    startsAt: timestamp("starts_at").notNull(),
    endsAt: timestamp("ends_at").notNull(),
    settlementMode: text("settlement_mode").default("host_account").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [
    index("event_branch_id_idx").on(table.branchId),
    index("event_starts_at_idx").on(table.startsAt),
  ],
);

export const eventAttendee = pgTable(
  "event_attendee",
  {
    id: text("id").primaryKey(),
    eventId: text("event_id")
      .notNull()
      .references(() => workspaceEvent.id, { onDelete: "cascade" }),
    personId: text("person_id")
      .notNull()
      .references(() => person.id, { onDelete: "restrict" }),
    visitId: text("visit_id").references(() => visit.id, { onDelete: "set null" }),
    status: eventAttendeeStatusEnum("status").default("invited").notNull(),
    checkedInAt: timestamp("checked_in_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("event_attendee_event_id_idx").on(table.eventId),
    index("event_attendee_person_id_idx").on(table.personId),
  ],
);
