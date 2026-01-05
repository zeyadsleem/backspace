import { render, screen, fireEvent } from "@testing-library/react";
import { PlanSelection } from "../plan-selection";

// Mock useI18n
jest.mock("@/lib/i18n", () => ({
  useI18n: () => ({
    language: "en",
    lang: (ar: string, en: string) => en,
  }),
}));

// Mock PLAN_TYPE_LABELS
jest.mock("@/lib/validation/schemas/subscription", () => ({
  PLAN_TYPE_LABELS: {
    weekly: { en: "Weekly", ar: "أسبوعي", days: 7 },
    "half-monthly": { en: "Half Monthly", ar: "نصف شهري", days: 15 },
    monthly: { en: "Monthly", ar: "شهري", days: 30 },
  },
}));

describe("PlanSelection", () => {
  const mockOnPlanSelect = jest.fn();
  const mockOnCancel = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders all plan types", () => {
    render(
      <PlanSelection selectedPlan={null} onPlanSelect={mockOnPlanSelect} onCancel={mockOnCancel} />,
    );

    expect(screen.getByText("Weekly")).toBeInTheDocument();
    expect(screen.getByText("Half Monthly")).toBeInTheDocument();
    expect(screen.getByText("Monthly")).toBeInTheDocument();
  });

  it("calls onPlanSelect when a plan is clicked", () => {
    render(
      <PlanSelection selectedPlan={null} onPlanSelect={mockOnPlanSelect} onCancel={mockOnCancel} />,
    );

    fireEvent.click(screen.getByText("Weekly"));
    expect(mockOnPlanSelect).toHaveBeenCalledWith("weekly");
  });

  it("highlights selected plan", () => {
    render(
      <PlanSelection
        selectedPlan="weekly"
        onPlanSelect={mockOnPlanSelect}
        onCancel={mockOnCancel}
      />,
    );

    const weeklyCard = screen.getByText("Weekly").closest("div");
    expect(weeklyCard).toHaveClass("ring-2", "ring-primary");
  });

  it("calls onCancel when cancel button is clicked", () => {
    render(
      <PlanSelection selectedPlan={null} onPlanSelect={mockOnPlanSelect} onCancel={mockOnCancel} />,
    );

    fireEvent.click(screen.getByText("Cancel"));
    expect(mockOnCancel).toHaveBeenCalled();
  });
});
