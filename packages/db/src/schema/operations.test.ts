import { describe, expect, it } from "vitest";

import { shift } from "./operations";

function shiftExtraConfig() {
  const builderSymbol = Object.getOwnPropertySymbols(shift).find(
    (symbol) => String(symbol) === "Symbol(drizzle:ExtraConfigBuilder)",
  );
  const columnsSymbol = Object.getOwnPropertySymbols(shift).find(
    (symbol) => String(symbol) === "Symbol(drizzle:ExtraConfigColumns)",
  );

  if (!builderSymbol || !columnsSymbol) return [];

  const builder = shift[builderSymbol as keyof typeof shift] as unknown as (
    columns: unknown,
  ) => unknown[];
  return builder(shift[columnsSymbol as keyof typeof shift]);
}

describe("operations schema", () => {
  it("prevents concurrent duplicate open shifts for the same staff and branch", () => {
    const configs = shiftExtraConfig();
    const index = configs.find(
      (config) =>
        typeof config === "object" &&
        config !== null &&
        "config" in config &&
        (config.config as { name?: string }).name === "shift_open_staff_branch_unique_idx",
    ) as
      | {
          config: {
            columns: { name: string }[];
            unique: boolean;
            where?: unknown;
          };
        }
      | undefined;

    expect(index?.config.unique).toBe(true);
    expect(index?.config.columns.map((column) => column.name)).toEqual([
      "branch_id",
      "opened_by_user_id",
    ]);
    expect(index?.config.where).toBeDefined();
  });
});
