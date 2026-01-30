export const formatCurrency = (piasters: number) => {
  // Convert piasters to EGP (100 piasters = 1.00 EGP)
  const amount = piasters / 100;
  return new Intl.NumberFormat("en-US", {
    style: "decimal",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

export const formatNumber = (value: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "decimal",
    minimumFractionDigits: 0,
  }).format(value);
};

// Helper to convert input EGP to Piasters for backend
export const toPiasters = (egpAmount: number): number => {
  return Math.round(egpAmount * 100);
};
