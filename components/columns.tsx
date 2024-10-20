// client component - contains admin user table column definitions
"use client";

import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";

import { Checkbox } from "@/components/ui/checkbox";
import { Database } from "@/database.types";

// Define a type alias for the profile row
type ProfileRow = Database["public"]["Tables"]["profile"]["Row"];

export const columns: ColumnDef<ProfileRow>[] = [
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
