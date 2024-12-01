"use client";
import React, { useState, useRef } from "react";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getSortedRowModel,
  SortingState,
} from "@tanstack/react-table";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Loader2,
  Trash2,
  ArrowUpDown,
  Save,
  X,
  Edit,
  Plus,
  Upload,
} from "lucide-react";
import Breadcrumb from "@/components/custom/Breadcrumbs";
import {
  useAllBadges,
  useAddBadge,
  useUpdateBadge,
  useDeleteBadge,
  useUploadBadge,
} from "@/hooks/useBadge";
import { Badge } from "@/types";

// Image upload component with loading state
const BadgeIconUpload = ({
  badge,
  onUpload,
}: {
  badge: Badge;
  onUpload: (file: File) => Promise<void>;
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      await onUpload(file);
    } finally {
      setIsUploading(false);
      // Clear the input to allow uploading the same file again
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  return (
    <div className="flex items-center gap-2">
      {badge.icon && (
        <img
          src={badge.icon}
          alt={badge.name}
          className="w-8 h-8 object-contain"
        />
      )}
      <div className="relative">
        <Button
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
        >
          {isUploading ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <Upload className="h-4 w-4 mr-2" />
          )}
          {badge.icon ? "Update" : "Upload"}
        </Button>
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept="image/*"
          onChange={handleFileChange}
        />
      </div>
    </div>
  );
};

// Editable input cell component (unchanged)
const EditableInputCell = ({
  value,
  onSave,
  onCancel,
}: {
  value: string;
  onSave: (value: string) => Promise<void>;
  onCancel: () => void;
}) => {
  const [editValue, setEditValue] = useState(value);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSave = async () => {
    setIsLoading(true);
    try {
      await onSave(editValue);
    } catch (error) {
      console.error("Failed to save:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex gap-2 items-center">
      <Input
        ref={inputRef}
        value={editValue}
        onChange={(e) => setEditValue(e.target.value)}
        className="flex-1"
      />
      <div className="flex gap-1">
        <Button
          size="icon"
          variant="outline"
          onClick={handleSave}
          disabled={isLoading}
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
        </Button>
        <Button size="icon" variant="outline" onClick={onCancel}>
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

// Editable textarea cell component (unchanged)
const EditableTextareaCell = ({
  value,
  onSave,
  onCancel,
}: {
  value: string;
  onSave: (value: string) => Promise<void>;
  onCancel: () => void;
}) => {
  const [editValue, setEditValue] = useState(value);
  const [isLoading, setIsLoading] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSave = async () => {
    setIsLoading(true);
    try {
      await onSave(editValue);
    } catch (error) {
      console.error("Failed to save:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex gap-2 items-start">
      <Textarea
        ref={textareaRef}
        value={editValue}
        onChange={(e) => setEditValue(e.target.value)}
        className="flex-1"
        rows={3}
      />
      <div className="flex gap-1">
        <Button
          size="icon"
          variant="outline"
          onClick={handleSave}
          disabled={isLoading}
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
        </Button>
        <Button size="icon" variant="outline" onClick={onCancel}>
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

const AdminBadgeManagement = () => {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [error, setError] = useState<string | null>(null);
  const [newBadge, setNewBadge] = useState({
    name: "",
    icon: null,
  });
  const [editingCell, setEditingCell] = useState<{
    id: string;
    field: "name";
  } | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const { data: badges = [], isLoading } = useAllBadges();
  const addBadgeMutation = useAddBadge();
  const updateBadgeMutation = useUpdateBadge();
  const deleteBadgeMutation = useDeleteBadge();
  const uploadBadgeMutation = useUploadBadge();

  const columnHelper = createColumnHelper<Badge>();
  const columns = [
    columnHelper.accessor("created_at", {
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Created
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: (info) => format(new Date(info.getValue()), "PP"),
    }),
    columnHelper.accessor("icon", {
      header: "Icon",
      cell: (info) => (
        <BadgeIconUpload
          badge={info.row.original}
          onUpload={async (file) => {
            await uploadBadgeMutation.mutateAsync({
              file,
              badgeId: info.row.original.id,
            });
          }}
        />
      ),
    }),
    columnHelper.accessor("name", {
      header: "Name",
      cell: (info) => {
        const isEditing =
          editingCell?.id === info.row.original.id &&
          editingCell.field === "name";

        return isEditing ? (
          <EditableInputCell
            value={info.getValue()}
            onSave={async (value) => {
              await updateBadgeMutation.mutateAsync({
                id: info.row.original.id,
                updates: { name: value },
              });
            }}
            onCancel={() => setEditingCell(null)}
          />
        ) : (
          <div className="flex items-center gap-2">
            <span>{info.getValue()}</span>
            <Button
              size="icon"
              variant="ghost"
              onClick={() =>
                setEditingCell({ id: info.row.original.id, field: "name" })
              }
            >
              <Edit className="h-4 w-4" />
            </Button>
          </div>
        );
      },
    }),
    columnHelper.accessor("id", {
      header: "Actions",
      cell: (info) => {
        const id = info.getValue();
        return deleteConfirmId === id ? (
          <div className="flex gap-2">
            <Button
              variant="destructive"
              size="sm"
              onClick={() => deleteBadgeMutation.mutate(id)}
            >
              Confirm
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDeleteConfirmId(null)}
            >
              Cancel
            </Button>
          </div>
        ) : (
          <Button
            variant="destructive"
            size="icon"
            onClick={() => setDeleteConfirmId(id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        );
      },
    }),
  ];

  const table = useReactTable({
    data: badges,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  const handleAddBadge = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      await addBadgeMutation.mutateAsync(newBadge);
      setNewBadge({ name: "", icon: null });
    } catch (err) {
      setError("Failed to add badge");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6">
      <Breadcrumb />
      <h1 className="text-2xl font-bold mb-6">Manage Badges</h1>

      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleAddBadge} className="space-y-4 mb-8">
        <div className="flex gap-4">
          <Input
            type="text"
            value={newBadge.name}
            onChange={(e) =>
              setNewBadge((prev) => ({ ...prev, name: e.target.value }))
            }
            placeholder="Badge Name"
            required
            className="flex-1"
          />
          <Button type="submit" disabled={addBadgeMutation.isPending}>
            {addBadgeMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Plus className="h-4 w-4" />
            )}
          </Button>
        </div>
      </form>

      <div className="border rounded-md">
        <table className="w-full">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="px-4 py-2 text-left font-medium border-b"
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="px-4 py-2 border-b">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminBadgeManagement;
