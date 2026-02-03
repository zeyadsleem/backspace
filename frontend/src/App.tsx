import {
	Clock,
	CreditCard,
	FileText,
	LayoutDashboard,
	Monitor,
	Package,
	Settings,
	Users,
} from "lucide-react";
import { useEffect } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { AppShell } from "./components/shell";
import { RTLProvider } from "./components/ui/RTLProvider";
import { useAppStore } from "./stores/use-app-store";

function App() {
	const navigate = useNavigate();
	const location = useLocation();
	const { isRTL, t, init } = useAppStore();

	useEffect(() => {
		init();
	}, [init]);

	const mainNavigationItems = [
		{
			label: t("dashboard"),
			href: "/dashboard",
			icon: <LayoutDashboard className="h-5 w-5" />,
		},
		{
			label: t("sessions"),
			href: "/sessions",
			icon: <Clock className="h-5 w-5" />,
		},
		{
			label: t("customers"),
			href: "/customers",
			icon: <Users className="h-5 w-5" />,
		},
		{
			label: t("resources"),
			href: "/resources",
			icon: <Monitor className="h-5 w-5" />,
		},
		{
			label: t("subscriptions"),
			href: "/subscriptions",
			icon: <CreditCard className="h-5 w-5" />,
		},
		{
			label: t("inventory"),
			href: "/inventory",
			icon: <Package className="h-5 w-5" />,
		},
		{
			label: t("invoices"),
			href: "/invoices",
			icon: <FileText className="h-5 w-5" />,
		},
		/*
    {
      label: t("reports"),
      href: "/reports",
      icon: <BarChart3 className="h-5 w-5" />,
    },
    */
	].map((item) => ({
		...item,
		isActive:
			location.pathname === item.href || (item.href === "/dashboard" && location.pathname === "/"),
	}));

	const settingsItem = {
		label: t("settings"),
		href: "/settings",
		icon: <Settings className="h-5 w-5" />,
		isActive: location.pathname === "/settings",
	};

	return (
		<RTLProvider>
			<AppShell
				isRTL={isRTL}
				navigationItems={mainNavigationItems}
				onNavigate={navigate}
				settingsItem={settingsItem}
			>
				<Outlet />
			</AppShell>
		</RTLProvider>
	);
}

export default App;
