import { env } from "@backspace/env/server";
import { drizzle } from "drizzle-orm/node-postgres";

import * as schema from "./schema";

export { and, eq } from "drizzle-orm";

export function createDb() {
  return drizzle(env.DATABASE_URL, { schema });
}

export const db = createDb();

export { role, permission, rolePermission, staffProfile, staffBranchAccess } from "./schema/staff";
export { branch } from "./schema/workspace";
