// app/admin/page.tsx
import { BarChart2, Gamepad, Medal, Settings, Users } from "lucide-react";
import { AdminDashboard } from "./components/AdminDashboard";
export default async function AdminPage() {
  // You can fetch any data needed for the admin dashboard here
  const adminLinks = [
    {
      title: "Profiles",
      description: "Manage user profiles and permissions",
      href: "/protected/admin/users",
      icon: <Users className="text-black" />,
      active: true,
    },
    {
      title: "Daily Game",
      description: "Manage upcoming daily games",
      href: "/protected/admin/daily",
      icon: <Gamepad className="text-black" />,
      active: true,
    },
    {
      title: "Badges",
      description: "Manage user badges and achievements",
      href: "/protected/admin/badges",
      icon: <Medal className="text-black" />,
      active: true,
    },
    {
      title: "Analytics",
      description: "View site statistics and reports",
      href: "/protected/admin/analytics",
      icon: <BarChart2 className="text-black" />,
      active: false,
    },
    {
      title: "Settings",
      description: "Configure system preferences",
      href: "/protected/admin/settings",
      icon: <Settings className="text-black" />,
      active: false,
    },
  ];

  return <AdminDashboard links={adminLinks} />;
}
