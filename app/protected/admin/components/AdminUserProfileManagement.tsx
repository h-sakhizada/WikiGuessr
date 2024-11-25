"use client";

import { deleteUser, togglePremium } from "@/actions/user-actions";
import Breadcrumb from "@/components/custom/Breadcrumbs";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { DataTable } from "@/components/ui/data-table";
import { useAllUsers } from "@/hooks/useUser";
import { User } from "@/types";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, Trash2 } from "lucide-react";
import { useState } from "react";

const AdminUserManagement = () => {
  const { data: users, isLoading, refetch } = useAllUsers();
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [confirmDeleteSelected, setConfirmDeleteSelected] = useState(false);

  if (isLoading) return <div>Loading...</div>;
  if (!users) return <div>No users found</div>;

  const handleDeleteUser = async (userId: string) => {
    const success = await deleteUser(userId);
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
      refetch(); // Refresh the users to show updated status
    } else {
      console.error("Failed to update premium status");
    }
  };

  const handleDeleteSelectedUsers = async () => {
    const nonAdminIds = selectedUserIds.filter((id) =>
      users.find((user) => user.id === id && !user.is_admin)
    );

    const deletePromises = nonAdminIds.map((id) => deleteUser(id));
    const results = await Promise.all(deletePromises);

    if (results.every((success) => success)) {
      refetch();
      setSelectedUserIds([]); // Clear selected IDs after deletion
    } else {
      console.error("Failed to delete some users");
    }

    setConfirmDeleteSelected(false);
  };

  const toggleSelectAll = (checked: boolean) => {
    const selectableIds = users
      .filter((user) => !user.is_admin)
      .map((user) => user.id);
    setSelectedUserIds(checked ? selectableIds : []);
  };

  const toggleSelectRow = (id: string, checked: boolean) => {
    const isSelectable = users.find((user) => user.id === id && !user.is_admin);
    setSelectedUserIds((prevSelected) =>
      checked && isSelectable
        ? [...prevSelected, id]
        : prevSelected.filter((selectedId) => selectedId !== id)
    );
  };

  const columns: ColumnDef<User>[] = [
    {
      id: "select",
      header: () => (
        <Checkbox
          checked={
            selectedUserIds.length ===
            users.filter((user) => !user.is_admin).length
          }
          onCheckedChange={(checked) => toggleSelectAll(!!checked)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={selectedUserIds.includes(row.original.id)}
          onCheckedChange={(checked) =>
            toggleSelectRow(row.original.id, !!checked)
          }
          disabled={row.original.is_admin ?? undefined} // Disable checkbox if the user is an admin
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
            handleTogglePremium(
              row.original.id,
              row.original.is_premium ?? false
            )
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
        const userId = row.original.id;
        const isAdmin = row.original.is_admin;

        return confirmDeleteId === userId ? (
          <div className="flex space-x-2">
            <Button
              variant="destructive"
              size="sm"
              onClick={() => handleDeleteUser(userId)}
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
            onClick={() => !isAdmin && setConfirmDeleteId(userId)}
            disabled={isAdmin ?? undefined} // Disable button if the user is an admin
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
      <h1 className="text-2xl font-bold mb-6">User Management</h1>

      <DataTable columns={columns} data={users} />

      {selectedUserIds.length > 0 &&
        (confirmDeleteSelected ? (
          <div className="flex space-x-2 mb-4">
            <Button variant="destructive" onClick={handleDeleteSelectedUsers}>
              Confirm Delete Selected ({selectedUserIds.length})
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
            Delete Selected ({selectedUserIds.length})
          </Button>
        ))}
    </div>
  );
};

export default AdminUserManagement;
