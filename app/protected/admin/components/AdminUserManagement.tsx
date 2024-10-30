"use client";

import { DataTable } from "@/components/ui/data-table";

// Import the profiles type from database.types.ts
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useAllProfiles } from "@/hooks/useAllProfiles";
import { Profile } from "@/types";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";

export default function AdminUserManagement() {
  // State to hold user data
  const { data: profiles, isLoading } = useAllProfiles();

  if (isLoading) return <div>Loading...</div>;
  if (!profiles) return <div>No profiles found</div>;

  const columns: ColumnDef<Profile>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "email",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Email
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
    },
    {
      accessorKey: "created_at",
      header: "Created At",
    },
    {
      accessorKey: "is_premium",
      header: "Is Premium",
    },
  ];

  return (
    <div>
      <h1>User Management</h1>
      <DataTable columns={columns} data={profiles} />
    </div>
  );
}
