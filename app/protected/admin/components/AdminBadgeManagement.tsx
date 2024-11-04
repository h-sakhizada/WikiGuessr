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
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/utils/supabase/client";

interface Badge {
  id: string;
  created_at: string;
  icon: string | null;
  name: string;
  description: string;
}

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
  const supabase = createClient();
  const queryClient = useQueryClient();
  const [sorting, setSorting] = useState<SortingState>([]);
  const [error, setError] = useState<string | null>(null);
  const [newBadge, setNewBadge] = useState({
    name: "",
    description: "",
  });
  const [editingCell, setEditingCell] = useState<{
    id: string;
    field: "name" | "description";
  } | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Fetch badges TDO: split to custom hook
  const { data: badges = [], isLoading } = useQuery({
    queryKey: ["badges"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("badge")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Badge[];
    },
  });

  // Upload mutation TODO: split to custom hook
  const uploadIcon = useMutation({
    mutationFn: async ({ file, badgeId }: { file: File; badgeId: string }) => {
      // First, delete the old icon if it exists
      const badge = badges.find((b) => b.id === badgeId);
      if (badge?.icon) {
        const oldIconPath = new URL(badge.icon).pathname.split("/").pop();
        if (oldIconPath) {
          await supabase.storage.from("badges").remove([oldIconPath]);
        }
      }

      // Upload new icon
      const fileExt = file.name.split(".").pop();
      const fileName = `${badgeId}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("badges")
        .upload(fileName, file, {
          cacheControl: "3600",
          upsert: true,
        });

      if (uploadError) throw uploadError;

      const {
        data: { publicUrl },
      } = supabase.storage.from("badges").getPublicUrl(fileName);

      // Update badge record with new icon URL
      const { error: updateError } = await supabase
        .from("badge")
        .update({ icon: publicUrl })
        .eq("id", badgeId);

      if (updateError) throw updateError;

      return publicUrl;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["badges"] });
    },
    onError: (error) => {
      console.error("Upload failed:", error);
      setError("Failed to upload icon");
    },
  });

  // Add badge mutation TODO: split to custom hook
  const addBadge = useMutation({
    mutationFn: async (badgeData: Partial<Badge>) => {
      const { data, error } = await supabase
        .from("badge")
        .insert([badgeData])
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["badges"] });
      setNewBadge({ name: "", description: "" });
    },
  });

  // Update badge mutation TODO: split to custom hook
  const updateBadge = useMutation({
    mutationFn: async ({
      id,
      updates,
    }: {
      id: string;
      updates: Partial<Badge>;
    }) => {
      const { error } = await supabase
        .from("badge")
        .update(updates)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["badges"] });
      setEditingCell(null);
    },
  });

  // Delete badge mutation TODO: split to custom hook
  const deleteBadge = useMutation({
    mutationFn: async (id: string) => {
      const badge = badges.find((b) => b.id === id);
      if (badge?.icon) {
        const iconPath = new URL(badge.icon).pathname.split("/").pop();
        if (iconPath) {
          await supabase.storage.from("badges").remove([iconPath]);
        }
      }
      const { error } = await supabase.from("badge").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["badges"] });
      setDeleteConfirmId(null);
    },
  });

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
            await uploadIcon.mutateAsync({
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
              await updateBadge.mutateAsync({
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
    columnHelper.accessor("description", {
      header: "Description",
      cell: (info) => {
        const isEditing =
          editingCell?.id === info.row.original.id &&
          editingCell.field === "description";

        return isEditing ? (
          <EditableTextareaCell
            value={info.getValue() || ""}
            onSave={async (value) => {
              await updateBadge.mutateAsync({
                id: info.row.original.id,
                updates: { description: value },
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
                setEditingCell({
                  id: info.row.original.id,
                  field: "description",
                })
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
              onClick={() => deleteBadge.mutate(id)}
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
      await addBadge.mutateAsync(newBadge);
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
          <Input
            type="text"
            value={newBadge.description}
            onChange={(e) =>
              setNewBadge((prev) => ({ ...prev, description: e.target.value }))
            }
            placeholder="Description"
            className="flex-1"
          />
          <Button type="submit" disabled={addBadge.isPending}>
            {addBadge.isPending ? (
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
