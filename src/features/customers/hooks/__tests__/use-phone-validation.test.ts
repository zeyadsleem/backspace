import { renderHook, act } from "@testing-library/react";
import { usePhoneValidation } from "../use-phone-validation";

// Mock the validation function
jest.mock("@/lib/validation/validators/egyptian-phone", () => ({
  validateEgyptianPhone: (phone: string) => {
    if (phone === "01012345678") {
      return {
        isValid: true,
        carrier: "Vodafone",
        normalized: "+201012345678",
      };
    }
    return {
      isValid: false,
      error: "رقم هاتف غير صالح | Invalid phone number",
    };
  },
}));

describe("usePhoneValidation", () => {
  it("should return initial state", () => {
    const { result } = renderHook(() => usePhoneValidation("en"));

    expect(result.current.validation).toEqual({
      isValid: true,
      carrier: null,
      error: null,
    });
  });

  it("should validate valid phone number", () => {
    const { result } = renderHook(() => usePhoneValidation("en"));

    act(() => {
      result.current.validatePhone("01012345678");
    });

    expect(result.current.validation).toEqual({
      isValid: true,
      carrier: "Vodafone",
      error: null,
    });
  });

  it("should validate invalid phone number", () => {
    const { result } = renderHook(() => usePhoneValidation("en"));

    act(() => {
      result.current.validatePhone("123");
    });

    expect(result.current.validation).toEqual({
      isValid: false,
      carrier: null,
      error: "Invalid phone number",
    });
  });

  it("should handle empty phone number", () => {
    const { result } = renderHook(() => usePhoneValidation("en"));

    act(() => {
      result.current.validatePhone("");
    });

    expect(result.current.validation).toEqual({
      isValid: false,
      carrier: null,
      error: null,
    });
  });

  it("should return Arabic error for Arabic language", () => {
    const { result } = renderHook(() => usePhoneValidation("ar"));

    act(() => {
      result.current.validatePhone("123");
    });

    expect(result.current.validation.error).toBe("رقم هاتف غير صالح");
  });
});
