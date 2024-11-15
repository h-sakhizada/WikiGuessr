"use client";

import React, { useState } from "react";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useAdminAllProfiles } from "@/hooks/useAllProfiles";
import { ColumnDef } from "@tanstack/react-table";
import Breadcrumb from "@/components/custom/Breadcrumbs";
import { deleteProfile, togglePremium } from "@/actions/profile-actions";
import { Loader2, Trash2, ArrowUpDown } from "lucide-react";

import { Profile } from "@/types";
import { ProfileWithUser } from "@/hooks/useAllProfiles";

const AdminUserManagement = () => {
  const { data: profiles, isLoading, refetch } = useAdminAllProfiles();
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [selectedProfileIds, setSelectedProfileIds] = useState<string[]>([]);
  const [confirmDeleteSelected, setConfirmDeleteSelected] = useState(false);

  if (isLoading) return <div>Loading...</div>;
  if (!profiles) return <div>No profiles found</div>;

  const handleDeleteUser = async (userId: string) => {
    const success = await deleteProfile(userId);
    if (success) {
      refetch();
      setConfirmDeleteId(null);
    } else {
      console.error("Failed to delete user");
    }
  };

  const handleTogglePremium = async (userId: string, isPremium: boolean) => {
    const success = await togglePremium(userId, isPremium);
    if (success) {
      refetch(); // Refresh the profiles to show updated status
      console.log("Profile premium status updated");
    } else {
      console.error("Failed to update premium status");
    }
  };

  const handleDeleteSelectedUsers = async () => {
    const nonAdminIds = selectedProfileIds.filter((id) =>
      profiles.find((profile) => profile.id === id && !profile.is_admin)
    );

    const deletePromises = nonAdminIds.map((id) => deleteProfile(id));
    const results = await Promise.all(deletePromises);

    if (results.every((success) => success)) {
      refetch();
      setSelectedProfileIds([]); // Clear selected IDs after deletion
      console.log("All selected non-admin users deleted successfully");
    } else {
      console.error("Failed to delete some users");
    }

    setConfirmDeleteSelected(false);
  };

  const toggleSelectAll = (checked: boolean) => {
    const selectableIds = profiles
      .filter((profile) => !profile.is_admin)
      .map((profile) => profile.id);
    setSelectedProfileIds(checked ? selectableIds : []);
  };

  const toggleSelectRow = (id: string, checked: boolean) => {
    const isSelectable = profiles.find(
      (profile) => profile.id === id && !profile.is_admin
    );
    setSelectedProfileIds((prevSelected) =>
      checked && isSelectable
        ? [...prevSelected, id]
        : prevSelected.filter((selectedId) => selectedId !== id)
    );
  };

  const columns: ColumnDef<ProfileWithUser>[] = [
    {
      id: "select",
      header: () => (
        <Checkbox
          checked={
            selectedProfileIds.length ===
            profiles.filter((profile) => !profile.is_admin).length
          }
          onCheckedChange={(checked) => toggleSelectAll(!!checked)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={selectedProfileIds.includes(row.original.id)}
          onCheckedChange={(checked) =>
            toggleSelectRow(row.original.id, !!checked)
          }
          disabled={row.original.is_admin} // Disable checkbox if the user is an admin
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "email",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Email
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
    },
    {
      accessorKey: "created_at",
      header: "Created At",
    },
    {
      accessorKey: "is_premium",
      header: "Premium Status",
      cell: ({ row }) => (
        <Button
          variant={row.original.is_premium ? "destructive" : "default"}
          onClick={() =>
            handleTogglePremium(row.original.id, row.original.is_premium)
          }
        >
          {row.original.is_premium ? "Unset Premium" : "Set Premium"}
        </Button>
      ),
    },
    {
      accessorKey: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const profileId = row.original.id;
        const isAdmin = row.original.is_admin;

        return confirmDeleteId === profileId ? (
          <div className="flex space-x-2">
            <Button
              variant="destructive"
              size="sm"
              onClick={() => handleDeleteUser(profileId)}
            >
              Confirm
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setConfirmDeleteId(null)}
            >
              Cancel
            </Button>
          </div>
        ) : (
          <Button
            variant="destructive"
            size="icon"
            title={isAdmin ? "Admin users cannot be deleted" : "Delete User"}
            onClick={() => !isAdmin && setConfirmDeleteId(profileId)}
            disabled={isAdmin}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        );
      },
    },
  ];

  return (
    <div>
      <Breadcrumb />
      <h1 className="text-2xl font-bold mb-6">User Profile Management</h1>

      <DataTable columns={columns} data={profiles} />

      {selectedProfileIds.length > 0 &&
        (confirmDeleteSelected ? (
          <div className="flex space-x-2 mb-4">
            <Button variant="destructive" onClick={handleDeleteSelectedUsers}>
              Confirm Delete Selected ({selectedProfileIds.length})
            </Button>
            <Button
              variant="secondary"
              onClick={() => setConfirmDeleteSelected(false)}
            >
              Cancel
            </Button>
          </div>
        ) : (
          <Button
            variant="destructive"
            onClick={() => setConfirmDeleteSelected(true)}
            className="mb-4"
          >
            Delete Selected ({selectedProfileIds.length})
          </Button>
        ))}
    </div>
  );
};

export default AdminUserManagement;
