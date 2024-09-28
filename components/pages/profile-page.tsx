"use client";
import { useProfile } from "@/hooks/useProfile";
import { redirect } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  editProfile,
  setProfileToFree,
  setProfileToPremium,
} from "@/actions/profile-actions";
import { PencilIcon, CheckIcon, Zap } from "lucide-react";
import LoadingSpinner from "../loading-spinner";
import toast, { Toaster } from "react-hot-toast";

export default function ProfilePage() {
  const user = useProfile();
  const [editingField, setEditingField] = useState<string | null>(null);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");

  if (user.isLoading) {
    return <LoadingSpinner />;
  }

  if (!user.data) {
    return redirect("/sign-in");
  }

  const handleEdit = (field: string) => {
    if (!user.data) return;
    if (field === "username") setUsername(user.data.username);
    if (field === "email") setEmail(user.data.email);
    setEditingField(field);
  };

  const handleSave = async (field: string) => {
    if (!user.data) return;
    try {
      const updatedData =
        field === "username"
          ? { ...user.data, username }
          : { ...user.data, email };
      await editProfile(updatedData);
      toast.success(
        `${field.charAt(0).toUpperCase() + field.slice(1)} updated successfully!`,
        {
          iconTheme: {
            primary: "black",
            secondary: "white",
          },
        }
      );
      setEditingField(null);
      user.refetch();
    } catch (error) {
      toast.error(`Failed to update ${field}. Please try again.`, {
        iconTheme: {
          primary: "red",
          secondary: "white",
        },
      });
    }
  };

  const handleUpgradeToPremium = async () => {
    try {
      await setProfileToPremium();
      toast.success("Account upgraded to premium successfully!", {
        iconTheme: {
          primary: "black",
          secondary: "white",
        },
      });
      user.refetch();
    } catch (error) {
      toast.error("Failed to upgrade account to premium. Please try again.", {
        iconTheme: {
          primary: "red",
          secondary: "white",
        },
      });
    }
  };

  const handleDowngradeToFree = async () => {
    try {
      await setProfileToFree();
      toast.success("Account downgraded to free successfully!", {
        iconTheme: {
          primary: "black",
          secondary: "white",
        },
      });
      user.refetch();
    } catch (error) {
      toast.error("Failed to downgrade account to free. Please try again.", {
        iconTheme: {
          primary: "red",
          secondary: "white",
        },
      });
    }
  };

  const renderField = (
    field: string,
    value: string,
    editable: boolean = true
  ) => {
    const isEditing = editingField === field;
    const fieldValue = field === "username" ? username : email;
    const setFieldValue = field === "username" ? setUsername : setEmail;
    return (
      <div className="space-y-2">
        <label
          htmlFor={field}
          className="block text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          {field.charAt(0).toUpperCase() + field.slice(1)}
        </label>
        <div className="flex items-center space-x-2">
          {isEditing ? (
            <Input
              id={field}
              type={field === "email" ? "email" : "text"}
              value={fieldValue}
              onChange={(e) => setFieldValue(e.target.value)}
              className="flex-grow"
            />
          ) : (
            <p className="flex-grow text-lg text-gray-500 dark:text-gray-400">
              {value}
            </p>
          )}
          {editable && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() =>
                isEditing ? handleSave(field) : handleEdit(field)
              }
            >
              {isEditing ? (
                <CheckIcon className="h-4 w-4" />
              ) : (
                <PencilIcon className="h-4 w-4" />
              )}
            </Button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="flex-1 w-full flex flex-col gap-3 p-3 sm:p-4 max-w-md mx-auto">
      <Toaster position="bottom-center" reverseOrder={false} />
      <div className="grow">
        <header className="text-center mb-2">
          <h1 className="text-2xl font-bold">Account Page</h1>
        </header>
        <div className="space-y-4">
          {renderField("username", user.data.username)}
          {renderField("email", user.data.email, false)}
          {renderField(
            "is_premium",
            user.data.is_premium ? "Premium User" : "Free User",
            false
          )}
        </div>
      </div>
      <Button variant="default" onClick={handleUpgradeToPremium}>
        <Zap className="h-4 w-4 mr-2" />
        Go Premium
      </Button>

      <Button variant="ghost" onClick={handleDowngradeToFree}>
        Downgrade to Free Account
      </Button>
    </div>
  );
}
