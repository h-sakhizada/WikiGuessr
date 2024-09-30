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
  const [isEditingUsername, setIsEditingUsername] = useState(false);
  const [usernameUpdate, setUsernameUpdate] = useState("");

  if (user.isLoading) {
    return <LoadingSpinner />;
  }

  if (!user.data) {
    return redirect("/sign-in");
  }

  const handleEditUsername = () => {
    if (!user.data) {
      toast.error("Failed to update username. Please try again.", {
        iconTheme: {
          primary: "red",
          secondary: "white",
        },
      });
      return;
    }

    setUsernameUpdate(user.data.username);
    setIsEditingUsername(true);
  };

  const handleSaveUsername = async () => {
    if (!user.data || usernameUpdate === user.data.username) {
      setIsEditingUsername(false);
      return;
    }

    try {
      const updatedData = {
        ...user.data,
        username: usernameUpdate,
      };
      await editProfile(updatedData);
      toast.success("Username updated successfully!", {
        iconTheme: {
          primary: "black",
          secondary: "white",
        },
      });
      setIsEditingUsername(false);
      user.refetch();
    } catch (error) {
      toast.error("Failed to update username. Please try again.", {
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

  return (
    <div className="flex-1 w-full flex flex-col gap-3 p-3 sm:p-4 max-w-md mx-auto">
      <Toaster position="bottom-center" reverseOrder={false} />
      <div className="grow">
        <header className="text-center mb-2">
          <h1 className="text-2xl font-bold">Account Page</h1>
        </header>
        <div className="space-y-4">
          <div className="space-y-2">
            <label
              htmlFor="username"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Username
            </label>
            <div className="flex items-center space-x-2">
              {isEditingUsername ? (
                <Input
                  id="username"
                  type="text"
                  value={usernameUpdate}
                  onChange={(e) => setUsernameUpdate(e.target.value)}
                  className="flex-grow"
                />
              ) : (
                <p className="flex-grow text-lg text-gray-500 dark:text-gray-400">
                  {user.data.username}
                </p>
              )}
              <Button
                variant="ghost"
                size="icon"
                onClick={
                  isEditingUsername ? handleSaveUsername : handleEditUsername
                }
              >
                {isEditingUsername ? (
                  <CheckIcon className="h-4 w-4" />
                ) : (
                  <PencilIcon className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Email Address
            </label>
            <p className="text-lg text-gray-500 dark:text-gray-400">
              {user.data.email}
            </p>
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Account Type
            </label>
            <p className="text-lg text-gray-500 dark:text-gray-400">
              {user.data.is_premium ? "Premium User" : "Free User"}
            </p>
          </div>
        </div>
      </div>
      {!user.data.is_premium ? (
        <Button variant="default" onClick={handleUpgradeToPremium}>
          <Zap className="h-4 w-4 mr-2" />
          Go Premium
        </Button>
      ) : (
        <Button variant="ghost" onClick={handleDowngradeToFree}>
          Downgrade to Free Account
        </Button>
      )}
    </div>
  );
}
