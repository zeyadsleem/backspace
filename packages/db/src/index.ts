import { env } from "@backspace/env/server";
import { drizzle } from "drizzle-orm/node-postgres";

import * as schema from "./schema";

export { and, eq, inArray, isNull, or } from "drizzle-orm";

export function createDb() {
  return drizzle(env.DATABASE_URL, { schema });
}

export const db = createDb();

export { role, permission, rolePermission, staffProfile, staffBranchAccess } from "./schema/staff";
export { branch, space } from "./schema/workspace";
export { shift } from "./schema/operations";
export { auditLog, approvalRequest } from "./schema/audit";
export { booking } from "./schema/bookings";
export { customerAccount } from "./schema/people";
export { charge, invoice, payment, invoiceItem, chargeTypeEnum } from "./schema/billing";
export { eventAttendee, workspaceEvent } from "./schema/events";
export { membership, membershipPlan } from "./schema/memberships";
export {
  visit,
  usageSession,
  visitTypeEnum,
  billingResponsibilityEnum,
  visitStatusEnum,
  usageSessionStatusEnum,
} from "./schema/visits";
