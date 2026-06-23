import { index, pgEnum, pgTable, text, timestamp } from "drizzle-orm/pg-core";

import { booking } from "./bookings";
import { membership } from "./memberships";
import { customerAccount, person } from "./people";
import { branch, space } from "./workspace";

export const visitTypeEnum = pgEnum("visit_type", [
  "walk_in",
  "member",
  "booking_customer",
  "hosted_guest",
  "event_attendee",
  "non_billable",
]);

export const billingResponsibilityEnum = pgEnum("billing_responsibility", [
  "visitor",
  "host",
  "company",
  "event",
  "subscription",
  "complimentary",
  "pay_later",
]);

export const visitStatusEnum = pgEnum("visit_status", ["active", "checked_out", "cancelled"]);

export const usageSessionStatusEnum = pgEnum("usage_session_status", [
  "active",
  "ended",
  "cancelled",
]);

export const visit = pgTable(
  "visit",
  {
    id: text("id").primaryKey(),
    branchId: text("branch_id")
      .notNull()
      .references(() => branch.id, { onDelete: "restrict" }),
    personId: text("person_id")
      .notNull()
      .references(() => person.id, { onDelete: "restrict" }),
    visitType: visitTypeEnum("visit_type").notNull(),
    billingResponsibility: billingResponsibilityEnum("billing_responsibility").notNull(),
    status: visitStatusEnum("status").default("active").notNull(),
    bookingId: text("booking_id").references(() => booking.id, { onDelete: "set null" }),
    membershipId: text("membership_id").references(() => membership.id, { onDelete: "set null" }),
    hostAccountId: text("host_account_id").references(() => customerAccount.id, {
      onDelete: "set null",
    }),
    checkedInAt: timestamp("checked_in_at").defaultNow().notNull(),
    checkedOutAt: timestamp("checked_out_at"),
    nonBillableReason: text("non_billable_reason"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [
    index("visit_branch_id_idx").on(table.branchId),
    index("visit_person_id_idx").on(table.personId),
    index("visit_status_idx").on(table.status),
  ],
);

export const usageSession = pgTable(
  "usage_session",
  {
    id: text("id").primaryKey(),
    visitId: text("visit_id")
      .notNull()
      .references(() => visit.id, { onDelete: "cascade" }),
    spaceId: text("space_id")
      .notNull()
      .references(() => space.id, { onDelete: "restrict" }),
    status: usageSessionStatusEnum("status").default("active").notNull(),
    startedAt: timestamp("started_at").defaultNow().notNull(),
    endedAt: timestamp("ended_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [
    index("usage_session_visit_id_idx").on(table.visitId),
    index("usage_session_space_id_idx").on(table.spaceId),
    index("usage_session_status_idx").on(table.status),
  ],
);

export const hostedGuestLink = pgTable(
  "hosted_guest_link",
  {
    id: text("id").primaryKey(),
    visitId: text("visit_id")
      .notNull()
      .references(() => visit.id, { onDelete: "cascade" }),
    hostAccountId: text("host_account_id")
      .notNull()
      .references(() => customerAccount.id, { onDelete: "restrict" }),
    guestPersonId: text("guest_person_id")
      .notNull()
      .references(() => person.id, { onDelete: "restrict" }),
    responsibility: billingResponsibilityEnum("responsibility").default("host").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [index("hosted_guest_link_visit_id_idx").on(table.visitId)],
);
