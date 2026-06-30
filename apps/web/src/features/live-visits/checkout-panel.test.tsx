import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { CheckoutPanel } from "./checkout-panel";
import type { CheckoutState } from "./checkout-panel";

const checkoutState: CheckoutState = {
  preview: {
    visitId: "visit-active",
    branchId: "branch-main",
    personId: "person-1",
    visitType: "walk_in",
    billingResponsibility: "visitor",
    activeSessions: [],
    lineItems: [
      {
        chargeId: "charge-1",
        label: "Day pass",
        type: "service",
        quantity: 1,
        amountCents: 1000,
        signedAmountCents: 1000,
        billingResponsibility: "visitor",
        currency: "EGP",
      },
    ],
    responsibilityGroups: [
      {
        responsibility: "visitor",
        label: "Visitor",
        subtotalCents: 1000,
        discountCents: 0,
        taxCents: 0,
        totalCents: 1000,
        outcome: "payable",
        billToPersonId: "person-1",
        billToAccountId: null,
      },
    ],
    totals: {
      subtotalCents: 1000,
      discountCents: 0,
      taxCents: 0,
      totalCents: 1000,
      currency: "EGP",
      amountDueNowCents: 1000,
      payLaterCents: 0,
      includedCents: 0,
      complimentaryCents: 0,
    },
    warnings: [],
    blockers: [],
  },
  isPreviewLoading: false,
  previewError: null,
  isFinalizing: false,
  finalizeError: null,
  finalizeResult: null,
};

describe("CheckoutPanel cash control", () => {
  it("shows a clear blocker when cash is selected without an open shift", () => {
    const markup = renderToString(
      <CheckoutPanel
        personName="Mohamed Ali"
        checkoutState={checkoutState}
        selectedMethod="cash"
        cashControl={{ status: "none", expectedCashCents: 0, cashPaymentCount: 0 }}
        onSelectMethod={() => {}}
        onFinalize={() => {}}
        onClose={() => {}}
      />,
    );

    expect(markup).toContain("Cash requires an open shift");
    expect(markup).toContain("Open a shift before finalizing cash checkout.");
  });

  it("shows the open shift expected cash context for cash payments", () => {
    const markup = renderToString(
      <CheckoutPanel
        personName="Mohamed Ali"
        checkoutState={checkoutState}
        selectedMethod="cash"
        cashControl={{
          status: "open",
          shiftId: "shift-open",
          expectedCashCents: 2500,
          cashPaymentCount: 2,
        }}
        onSelectMethod={() => {}}
        onFinalize={() => {}}
        onClose={() => {}}
      />,
    );
    const normalizedMarkup = markup.replaceAll("<!-- -->", "");

    expect(normalizedMarkup).toContain("Cash will post to open shift");
    expect(normalizedMarkup).toContain("25.00 EGP expected");
    expect(normalizedMarkup).toContain("2 cash payments");
  });
});
