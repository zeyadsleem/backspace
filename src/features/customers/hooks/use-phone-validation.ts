import { useState, useCallback } from "react";
import { validateEgyptianPhone } from "@/lib/validation/validators/egyptian-phone";

interface PhoneValidation {
  isValid: boolean;
  carrier: string | null;
  error: string | null;
}

export function usePhoneValidation(language: string) {
  const [validation, setValidation] = useState<PhoneValidation>({
    isValid: true,
    carrier: null,
    error: null,
  });

  const validatePhone = useCallback(
    (value: string) => {
      if (!value?.trim()) {
        setValidation({ isValid: false, carrier: null, error: null });
        return;
      }

      const result = validateEgyptianPhone(value);
      setValidation({
        isValid: result.isValid,
        carrier: result.carrier,
        error: result.isValid
          ? null
          : language === "ar"
            ? result.error?.split("|")[0]
            : result.error?.split("|")[1] || result.error,
      });
    },
    [language],
  );

  return { validation, validatePhone };
}
