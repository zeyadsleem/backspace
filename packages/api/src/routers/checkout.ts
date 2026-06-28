import { z } from "zod";

import { staffProcedure } from "../index";
import { PERMISSIONS } from "../permissions/constants";
import { checkBranchAccess, checkPermission } from "../permissions/middleware";
import { finalizeCheckout, previewCheckout } from "../checkout/checkout";

const paymentSchema = z.object({
  responsibility: z.string().min(1),
  method: z.enum([
    "cash",
    "card_terminal",
    "wallet",
    "bank_transfer",
    "instapay",
    "mixed",
    "pay_later",
    "host_account",
    "included",
    "complimentary",
  ]),
  amountCents: z.number().int().nonnegative(),
  reference: z.string().optional(),
});

export const checkoutRouter = {
  preview: staffProcedure
    .input(
      z.object({
        branchId: z.string().min(1),
        visitId: z.string().min(1),
      }),
    )
    .query(async ({ ctx, input }) => {
      checkPermission(ctx.staff, PERMISSIONS.CHECKOUT_PREVIEW);
      await checkBranchAccess(ctx.staff.id, input.branchId);

      return previewCheckout({
        branchId: input.branchId,
        visitId: input.visitId,
      });
    }),
  finalize: staffProcedure
    .input(
      z.object({
        branchId: z.string().min(1),
        visitId: z.string().min(1),
        payments: z.array(paymentSchema).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      checkPermission(ctx.staff, PERMISSIONS.CHECKOUT_FINALIZE);
      await checkBranchAccess(ctx.staff.id, input.branchId);

      if (input.payments && input.payments.length > 0) {
        checkPermission(ctx.staff, PERMISSIONS.PAYMENT_RECORD);
      }

      return finalizeCheckout({
        branchId: input.branchId,
        visitId: input.visitId,
        staffActorUserId: ctx.staff.userId,
        payments: input.payments,
      });
    }),
};
