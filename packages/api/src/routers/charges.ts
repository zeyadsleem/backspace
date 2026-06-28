import { z } from "zod";

import { PERMISSIONS } from "../permissions/constants";
import { checkBranchAccess, checkPermission } from "../permissions/middleware";
import { staffProcedure } from "../index";
import { addCharge } from "../charges/add-charge";

const chargeTypeEnum = z.enum([
  "product",
  "service",
  "fee",
  "discount",
  "complimentary",
  "adjustment",
]);

const billingRespEnum = z.enum([
  "visitor",
  "host",
  "company",
  "event",
  "subscription",
  "complimentary",
  "pay_later",
]);

const targetTypeEnum = z.enum(["visit", "usage_session", "event", "host_account"]);

export const chargesRouter = {
  add: staffProcedure
    .input(
      z.object({
        branchId: z.string().min(1),
        targetType: targetTypeEnum,
        targetId: z.string().min(1),
        type: chargeTypeEnum,
        label: z.string().min(1),
        quantity: z.number().int().positive(),
        amountCents: z.number().int().nonnegative(),
        currency: z.enum(["EGP", "USD"]),
        billingResponsibility: billingRespEnum,
        reason: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      checkPermission(ctx.staff, PERMISSIONS.CHARGE_ADD);
      await checkBranchAccess(ctx.staff.id, input.branchId);

      return addCharge({
        branchId: input.branchId,
        targetType: input.targetType,
        targetId: input.targetId,
        type: input.type,
        label: input.label,
        quantity: input.quantity,
        amountCents: input.amountCents,
        currency: input.currency,
        billingResponsibility: input.billingResponsibility,
        reason: input.reason,
        staffActorUserId: ctx.staff.userId,
      });
    }),
};
