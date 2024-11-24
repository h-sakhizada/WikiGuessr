"use client";
import React, { useState, useRef, useEffect } from "react";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getSortedRowModel,
  SortingState,
} from "@tanstack/react-table";
import { useAdminDailyGames, DailyGame } from "@/hooks/useAdminDailyGames";
import { format, isAfter, parseISO, startOfDay } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Loader2,
  Trash2,
  ArrowUpDown,
  Save,
  X,
  Edit,
  ExternalLink,
  Plus,
} from "lucide-react";
import Breadcrumb from "@/components/custom/Breadcrumbs";

// Create a separate EditableCell component to handle the editing state
const EditableCell = React.memo(
  ({
    id,
    initialValue,
    onSave,
    onCancel,
  }: {
    id: string;
    initialValue: string;
    onSave: (id: string, value: string) => Promise<void>;
    onCancel: (id: string) => void;
  }) => {
    const [value, setValue] = useState(initialValue);
    const [isLoading, setIsLoading] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }, []);

    const handleSave = async () => {
      setIsLoading(true);
      try {
        await onSave(id, value);
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
          value={value}
          onChange={(e) => setValue(e.target.value)}
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
          <Button size="icon" variant="outline" onClick={() => onCancel(id)}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  }
);

EditableCell.displayName = "EditableCell";

const AdminDailyGames = () => {
  const { games, isLoading, addGame, updateGame, deleteGame } =
    useAdminDailyGames();
  const [newGameDate, setNewGameDate] = useState("");
  const [newGameTitle, setNewGameTitle] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  const handleSave = async (id: string, newTitle: string) => {
    try {
      await updateGame.mutateAsync({
        id,
        game: { article_title: newTitle },
      });
      setEditingId(null);
    } catch (err) {
      setError("Failed to update game");
    }
  };

  const columnHelper = createColumnHelper<DailyGame>();

  const columns = [
    columnHelper.accessor("day_of_game", {
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Date
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: (info) => format(parseISO(info.getValue()), "PP"),
    }),
    columnHelper.accessor("article_title", {
      header: "Article Title",
      cell: (info) => {
        const id = info.row.original.id;
        const isEditing = editingId === id;

        console.log(id, isEditing);
        if (isEditing) {
          return (
            <EditableCell
              id={id}
              initialValue={info.getValue()}
              onSave={handleSave}
              onCancel={() => setEditingId(null)}
            />
          );
        }

        return (
          <div className="flex gap-2 items-center">
            <span className="flex-1">{info.getValue()}</span>
            <Button
              size="icon"
              variant="ghost"
              onClick={() => setEditingId(id)}
              title="Edit Game Title"
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
        const articleTitle = info.row.original.article_title;
        const wikipediaUrl = `https://wikipedia.org/wiki/${encodeURIComponent(articleTitle)}`;

        return (
          <div className="flex gap-2 ">
            {deleteConfirmId === id ? (
              <>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDeleteGame(id)}
                  title="Confirm Delete"
                >
                  Confirm
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setDeleteConfirmId(null)}
                  title="Cancel Delete"
                >
                  Cancel
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => window.open(wikipediaUrl, "_blank")}
                  title="Visit Wikipedia article"
                >
                  <ExternalLink className="h-4 w-4" />
                </Button>
                <Button
                  variant="destructive"
                  size="icon"
                  onClick={() => setDeleteConfirmId(id)}
                  title="Delete Game"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </>
            )}
          </div>
        );
      },
    }),
  ];

  const table = useReactTable({
    data: games || [],
    columns,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  const handleAddGame = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const gameDate = parseISO(newGameDate);
    const today = startOfDay(new Date());

    if (!isAfter(gameDate, today)) {
      setError("Game date must be in the future");
      return;
    }

    try {
      await addGame.mutateAsync({
        day_of_game: newGameDate,
        article_title: newGameTitle,
      });
      setNewGameDate("");
      setNewGameTitle("");
    } catch (err) {
      setError("Failed to add game");
    }
  };

  const handleDeleteGame = async (id: string) => {
    try {
      await deleteGame.mutateAsync(id);
      setDeleteConfirmId(null);
    } catch (err) {
      setError("Failed to delete game");
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
    <div>
      <Breadcrumb />

      <h1 className="text-2xl font-bold mb-6">Manage Daily Games</h1>

      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleAddGame} className="space-y-4 mb-8">
        <div className="flex gap-4">
          <Input
            type="date"
            value={newGameDate}
            onChange={(e) => setNewGameDate(e.target.value)}
            required
            className="w-36"
          />
          <Input
            type="text"
            value={newGameTitle}
            onChange={(e) => setNewGameTitle(e.target.value)}
            placeholder="Article Title"
            required
            className="flex-1"
          />
          <Button type="submit" disabled={addGame.isPending}>
            {addGame.isPending ? (
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

export default AdminDailyGames;
