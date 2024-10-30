"use client";

import React, { useState, useEffect } from "react";

import { getAllProfiles } from "@/actions/profile-actions";
import { DataTable } from "@/components/ui/data-table";

// Import the profiles type from database.types.ts
import { Database } from "@/database.types";
import { useAllProfiles } from "@/hooks/useAllProfiles";
import { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { ArrowUpDown } from "lucide-react";

// Define a type alias for the profile row
type ProfileRow = Database["public"]["Tables"]["profile"]["Row"];

export default function AdminClientPage() {
  // State to hold user data
  const { data: profiles, isLoading } = useAllProfiles();

  if (isLoading) return <div>Loading...</div>;
  if (!profiles) return <div>No profiles found</div>;

  const columns: ColumnDef<ProfileRow>[] = [
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
      <h1>Admin Page</h1>
      <DataTable columns={columns} data={profiles} />
    </div>
  );
}
