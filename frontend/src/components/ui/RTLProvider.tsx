import { useLayoutEffect } from "react";
import { useAppStore } from "@/stores/use-app-store";

interface RTLProviderProps {
	children: React.ReactNode;
}

export function RTLProvider({ children }: RTLProviderProps) {
	const { isRTL, language } = useAppStore();

	useLayoutEffect(() => {
		// Apply RTL direction to document immediately before paint
		document.documentElement.dir = isRTL ? "rtl" : "ltr";
		document.documentElement.lang = language;

		// Add RTL class to body for additional styling
		if (isRTL) {
			document.body.classList.add("rtl");
		} else {
			document.body.classList.remove("rtl");
		}
	}, [isRTL, language]);

	return <>{children}</>;
}
