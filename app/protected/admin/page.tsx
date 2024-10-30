// app/admin/page.tsx
import { BarChart2, Gamepad, Settings, Users } from "lucide-react";
import { AdminDashboard } from "./components/AdminDashboard";
export default async function AdminPage() {
  // You can fetch any data needed for the admin dashboard here
  const adminLinks = [
    {
      title: "Users",
      description: "Manage user accounts and permissions",
      href: "/admin/users",
      icon: <Users />,
      active: true,
    },
    {
      title: "Analytics",
      description: "View site statistics and reports",
      href: "/admin/analytics",
      icon: <BarChart2 />,
      active: false,
    },
    {
      title: "Daily Game",
      description: "Manage upcoming daily games",
      href: "/admin/daily",
      icon: <Gamepad />,
      active: false,
    },
    {
      title: "Settings",
      description: "Configure system preferences",
      href: "/admin/settings",
      icon: <Settings />,
      active: false,
    },
  ];

  return <AdminDashboard links={adminLinks} />;
}
