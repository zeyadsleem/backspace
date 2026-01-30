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

  return (
    <Toaster
      position="bottom-center"
      reverseOrder={false}
      gutter={8}
      containerStyle={{
        bottom: 40,
      }}
      toastOptions={{
        className: "dark:bg-stone-900 dark:text-stone-100 dark:border-stone-800 border shadow-lg text-sm font-medium",
        duration: 4000,
        style: {
          direction: "rtl",
          textAlign: "right",
          fontFamily: "'Cairo', sans-serif",
        },
      }}
    />
  );
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <RouterProvider router={router} />
    <AppToaster />
  </StrictMode>
);
