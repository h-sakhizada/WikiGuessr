// app/admin/page.tsx
import { BarChart2, Gamepad, Medal, Users } from "lucide-react";
import { AdminDashboard } from "./components/AdminDashboard";
export default async function AdminPage() {
  // You can fetch any data needed for the admin dashboard here
  const adminLinks = [
    {
      title: "Profiles",
      description: "Manage user profiles and permissions",
      href: "/protected/admin/profiles",
      icon: <Users className="text-secondary" />,
      active: true,
    },
    {
      title: "Daily Game",
      description: "Manage upcoming daily games",
      href: "/protected/admin/daily",
      icon: <Gamepad className="text-secondary" />,
      active: true,
    },
    {
      title: "Badges",
      description: "Manage user badges and achievements",
      href: "/protected/admin/badges",
      icon: <Medal className="text-secondary" />,
      active: true,
    },
    {
      title: "Analytics",
      description: "View site statistics and reports",
      href: "/protected/admin/analytics",
      icon: <BarChart2 className="text-secondary" />,
      active: true,
    },
  ];

  return <AdminDashboard links={adminLinks} />;
}
