import { lazy, Suspense } from "react";
import { createHashRouter, Navigate } from "react-router-dom";
import App from "../App";
import { LoadingState } from "../components/shared/LoadingState";

const DashboardPage = lazy(() =>
  import("../pages/DashboardPage").then((m) => ({ default: m.DashboardPage }))
);
const CustomersPage = lazy(() =>
  import("../pages/CustomersPage").then((m) => ({ default: m.CustomersPage }))
);
const CustomerProfilePage = lazy(() =>
  import("../pages/CustomerProfilePage").then((m) => ({ default: m.CustomerProfilePage }))
);
const ResourcesPage = lazy(() =>
  import("../pages/ResourcesPage").then((m) => ({ default: m.ResourcesPage }))
);
const SessionsPage = lazy(() =>
  import("../pages/SessionsPage").then((m) => ({ default: m.SessionsPage }))
);
const SubscriptionsPage = lazy(() =>
  import("../pages/SubscriptionsPage").then((m) => ({ default: m.SubscriptionsPage }))
);
const InventoryPage = lazy(() =>
  import("../pages/InventoryPage").then((m) => ({ default: m.InventoryPage }))
);
const InvoicesPage = lazy(() =>
  import("../pages/InvoicesPage").then((m) => ({ default: m.InvoicesPage }))
);
const ReportsPageWrapper = lazy(() =>
  import("../pages/ReportsPageWrapper").then((m) => ({ default: m.ReportsPageWrapper }))
);
const SettingsPageWrapper = lazy(() =>
  import("../pages/SettingsPageWrapper").then((m) => ({ default: m.SettingsPageWrapper }))
);

export const router = createHashRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        index: true,
        element: (
          <Suspense fallback={<LoadingState />}>
            <DashboardPage />
          </Suspense>
        ),
      },
      {
        path: "dashboard",
        element: (
          <Suspense fallback={<LoadingState />}>
            <DashboardPage />
          </Suspense>
        ),
      },
      {
        path: "customers",
        element: (
          <Suspense fallback={<LoadingState />}>
            <CustomersPage />
          </Suspense>
        ),
      },
      {
        path: "customers/:id",
        element: (
          <Suspense fallback={<LoadingState />}>
            <CustomerProfilePage />
          </Suspense>
        ),
      },
      {
        path: "resources",
        element: (
          <Suspense fallback={<LoadingState />}>
            <ResourcesPage />
          </Suspense>
        ),
      },
      {
        path: "sessions",
        element: (
          <Suspense fallback={<LoadingState />}>
            <SessionsPage />
          </Suspense>
        ),
      },
      {
        path: "subscriptions",
        element: (
          <Suspense fallback={<LoadingState />}>
            <SubscriptionsPage />
          </Suspense>
        ),
      },
      {
        path: "inventory",
        element: (
          <Suspense fallback={<LoadingState />}>
            <InventoryPage />
          </Suspense>
        ),
      },
      {
        path: "invoices",
        element: (
          <Suspense fallback={<LoadingState />}>
            <InvoicesPage />
          </Suspense>
        ),
      },
      {
        path: "reports",
        element: (
          <Suspense fallback={<LoadingState />}>
            <ReportsPageWrapper />
          </Suspense>
        ),
      },
      {
        path: "settings",
        element: (
          <Suspense fallback={<LoadingState />}>
            <SettingsPageWrapper />
          </Suspense>
        ),
      },
      {
        path: "*",
        element: <Navigate to="/" replace />,
      },
    ],
  },
]);
