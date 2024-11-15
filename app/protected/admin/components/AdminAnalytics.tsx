"use client";

import React, { useState, useEffect } from "react";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, ArrowUpDown } from "lucide-react";
import Breadcrumb from "@/components/custom/Breadcrumbs";
// import { useAnalyticsData } from "@/hooks/useAnalyticsData";  // Custom hook to fetch analytics data
// import { AnalyticsData } from "@/types";  // Define your data type
import { ColumnDef } from "@tanstack/react-table";

const AdminAnalyticsManagement = () => {
  // const { data: analytics, isLoading, refetch } = useAnalyticsData();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [confirmDelete, setConfirmDelete] = useState<boolean>(false);

  // useEffect(() => {
  //   if (analytics) {
  //     console.log("Analytics data loaded", analytics);
  //   }
  // }, [analytics]);

  // if (isLoading) return <div>Loading...</div>;
  // if (!analytics) return <div>No analytics data available</div>;

  // const toggleSelectAll = (checked: boolean) => {
  //   const allIds = analytics.map((item) => item.id);
  //   setSelectedIds(checked ? allIds : []);
  // };

  const toggleSelectRow = (id: string, checked: boolean) => {
    setSelectedIds((prevSelected) =>
      checked ? [...prevSelected, id] : prevSelected.filter((selectedId) => selectedId !== id)
    );
  };

  // const columns: ColumnDef<AnalyticsData>[] = [
  //   {
  //     id: "select",
  //     header: () => (
  //       <Checkbox
  //         // checked={selectedIds.length === analytics.length}
  //         onCheckedChange={(checked) => toggleSelectAll(!!checked)}
  //         aria-label="Select all"
  //       />
  //     ),
  //     cell: ({ row }) => (
  //       <Checkbox
  //         checked={selectedIds.includes(row.original.id)}
  //         onCheckedChange={(checked) => toggleSelectRow(row.original.id, !!checked)}
  //         aria-label="Select row"
  //       />
  //     ),
  //     enableSorting: false,
  //     enableHiding: false,
  //   },
  //   {
  //     accessorKey: "metric_name",
  //     header: ({ column }) => (
  //       <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
  //         Metric Name
  //         <ArrowUpDown className="ml-2 h-4 w-4" />
  //       </Button>
  //     ),
  //   },
  //   {
  //     accessorKey: "value",
  //     header: "Value",
  //   },
  //   {
  //     accessorKey: "date_range",
  //     header: "Date Range",
  //   },
  //   {
  //     accessorKey: "actions",
  //     header: "Actions",
  //     cell: ({ row }) => (
  //       <div className="flex space-x-2">
  //         <Button variant="secondary" size="sm" onClick={() => console.log("Viewing details for", row.original.id)}>
  //           View Details
  //         </Button>
  //         <Button
  //           variant="destructive"
  //           size="sm"
  //           onClick={() => setConfirmDelete(true)}
  //         >
  //           Delete
  //         </Button>
  //       </div>
  //     ),
  //   },
  // ];

  const handleDeleteSelectedItems = async () => {
    // Handle delete selected analytics items logic
    console.log("Deleting selected items: ", selectedIds);
    setSelectedIds([]);
    setConfirmDelete(false);
  };

  return (
    <div>
      <Breadcrumb />
      <h1>Analytics Dashboard</h1>
      {/* <DataTable columns={columns} data={analytics} /> */}

      {selectedIds.length > 0 && confirmDelete && (
        <div className="flex space-x-2 mb-4">
          <Button variant="destructive" onClick={handleDeleteSelectedItems}>
            Confirm Delete Selected ({selectedIds.length})
          </Button>
          <Button variant="secondary" onClick={() => setConfirmDelete(false)}>
            Cancel
          </Button>
        </div>
      )}
    </div>
  );
};

export default AdminAnalyticsManagement;
