import { StrictMode, useEffect } from "react";
import { createRoot } from "react-dom/client";
import toast, { Toaster, useToasterStore } from "react-hot-toast";
import { RouterProvider } from "react-router-dom";

// Font imports for offline availability
import "@fontsource/cairo/400.css";
import "@fontsource/cairo/600.css";
import "@fontsource/cairo/700.css";
import "@fontsource/ibm-plex-sans/400.css";
import "@fontsource/ibm-plex-sans/600.css";
import "@fontsource/ibm-plex-mono/400.css";

import "./index.css";
import { ErrorBoundary } from "./components/error-boundary";
import { router } from "./lib/router";

function AppToaster() {
	const { toasts } = useToasterStore();
	const TOAST_LIMIT = 3;

	useEffect(() => {
		toasts
			.filter((t) => t.visible)
			.filter((_, i) => i >= TOAST_LIMIT)
			.forEach((t) => toast.dismiss(t.id));
	}, [toasts]);

	// Detect language for proper toast direction
	const isRTL = document.documentElement.lang === "ar";

	return (
		<Toaster
			position="bottom-center"
			reverseOrder={false}
			gutter={8}
			containerStyle={{
				bottom: 40,
			}}
			toastOptions={{
				className:
					"dark:bg-stone-900 dark:text-stone-100 dark:border-stone-800 border shadow-lg text-sm font-medium",
				duration: 4000,
				style: {
					direction: isRTL ? "rtl" : "ltr",
					textAlign: isRTL ? "right" : "left",
					fontFamily: isRTL ? "'Cairo', sans-serif" : "'IBM Plex Sans', sans-serif",
				},
			}}
		/>
	);
}

const rootElement = document.getElementById("root");
if (!rootElement) {
	throw new Error("Root element not found");
}

createRoot(rootElement).render(
	<StrictMode>
		<ErrorBoundary>
			<RouterProvider router={router} />
			<AppToaster />
		</ErrorBoundary>
	</StrictMode>,
);
