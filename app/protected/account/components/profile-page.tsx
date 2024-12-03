"use client";
import {
  editUser,
  setUserToFree,
  setSelectedBadge,
  getSelectedBadge,
} from "@/actions/user-actions";
import { Button } from "@/components/ui/button";
import { useUser } from "@/hooks/useUser";
import { User } from "@/types";
import {
  Camera,
  LineChart,
  MessageCircleQuestion,
  PlusCircle,
  Zap,
} from "lucide-react";
import { redirect } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import EditableInput from "../../../../components/custom/EditableInput";
import LoadingSpinner from "../../../../components/loading-spinner";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import BadgeModal from "../../../../components/ui/badgeModal";
import Breadcrumb from "@/components/custom/Breadcrumbs";
import { useUserSelectedBadges } from "@/hooks/useBadge";

export default function ProfileClientPage() {
  const { data: user, isLoading, refetch } = useUser();
  const { data: badgesData } = useUserSelectedBadges();
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [equippedBadge, setEquippedBadge] = useState<string | null>(null);

  const fetchEquippedBadge = async () => {
    try {
      const badgeId = await getSelectedBadge();
      setEquippedBadge(badgeId);
    } catch (error) {
      console.error("Failed to fetch equipped badge:", error);
    }
  };

  useEffect(() => {
    if (user) {
      setAvatarPreview(
        user.avatar?.trim() || "/assets/default_profile_img.png"
      );
    }

    fetchEquippedBadge();
  }, [user]);

  if (isLoading) return <LoadingSpinner />;
  if (!user) return redirect("/sign-in");

  const handleSave = async (field: keyof User, value: string) => {
    if (!user || user[field] === value) return;

    try {
      const updatedData = { ...user, [field]: value };
      await editUser(updatedData);
      toast.success(`${field} updated successfully!`);
      refetch();
    } catch (error) {
      toast.error(`Failed to update ${field}. Please try again.`);
    }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e?.target?.files?.[0];
    if (!file || !user?.id) return;

    const supabase = createClient();

    // Define file path using user ID for RLS
    const fileExt = file.name.split(".").pop();
    const fileName = `${user.id}/${Date.now()}.${fileExt}`;

    await toast.promise(
      (async () => {
        try {
          // First, try to delete the old file if it exists
          if (user.avatar) {
            try {
              const oldFilePath = new URL(user.avatar).pathname
                .split("/")
                .pop();
              if (oldFilePath) {
                await supabase.storage
                  .from("profile_pictures")
                  .remove([`${user.id}/${oldFilePath}`]);
              }
            } catch (error) {
              console.error("No old file to delete or error deleting:", error);
            }
          }

          // Upload new file
          const { data: uploadData, error: uploadError } =
            await supabase.storage
              .from("profile_pictures")
              .upload(fileName, file, {
                cacheControl: "3600",
                upsert: true,
              });

          if (uploadError) {
            console.error("Upload error:", uploadError);
            throw new Error(uploadError.message);
          }

          // Get the public URL
          const {
            data: { publicUrl },
          } = supabase.storage.from("profile_pictures").getPublicUrl(fileName);

          // Update user user with new avatar URL
          await editUser({ ...user, avatar: publicUrl });

          // Update local preview
          setAvatarPreview(publicUrl);

          // Refresh user data
          await refetch();

          return publicUrl;
        } catch (error) {
          console.error("Error in upload process:", error);
          throw error;
        }
      })(),
      {
        loading: "Uploading picture...",
        success: "User picture updated successfully!",
        error: (error) =>
          `Upload failed: ${error.message || "Please try again"}`,
      }
    );
  };

  const handleAccountTypeChange = async () => {
    try {
      if (user.is_premium) {
        await setUserToFree();
        toast.success("Account downgraded to free successfully!");
      } else {
        window.location.href = "/protected/transaction";
      }
      refetch();
    } catch (error) {
      toast.error("Failed to change account type. Please try again.");
    }
  };

  const handleBadgeClick = async (badgeId: string) => {
    await setSelectedBadge(badgeId);
    setEquippedBadge(badgeId);
  };

  const renderBadges = () => {
    if (!badgesData)
      return (
        <div className="text-sm text-gray-500 my-5">
          You Don't Own Any Badges
        </div>
      );

    const selectedBadgeIds = new Set(badgesData.meta?.map((m) => m.badge_id));

    return (
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "15px",
          padding: "10px",
        }}
        className="my-5"
      >
        {badgesData?.badges
          ?.filter((badge) => selectedBadgeIds.has(badge.id))
          .map((badge) => (
            <div
              key={badge.id}
              className={`flex flex-col items-center p-2 rounded-lg shadow-sm cursor-pointer ${
                badge.id == equippedBadge
                  ? "bg-green-500"
                  : "bg-gray-100 dark:bg-gray-800"
              }`}
              onClick={() => handleBadgeClick(badge.id)}
            >
              <img
                src={badge.icon ?? ""}
                className="w-10 h-10 mb-1"
                alt={badge.name}
              />
              <span className="text-xs font-medium text-center">
                {badge.name}
              </span>
            </div>
          ))}
      </div>
    );
  };

  const renderEquippedBadge = () => {
    if (!badgesData || !equippedBadge) {
      return (
        <button className="text-sm text-gray-500">No Badge Equipped</button>
      );
    }

    const badge = badgesData.badges.find((b) => b.id === equippedBadge);

    if (!badge) {
      return (
        <button className="text-sm text-gray-500">No Badge Equipped</button>
      );
    }

    return (
      <div
        className="flex flex-col items-center p-2 bg-green-500 rounded-lg shadow-sm"
        key={badge.id}
        style={{ width: "12%" }}
      >
        <img
          src={badge.icon ?? ""}
          className="w-10 h-10 mb-1"
          alt={badge.name}
        />
        <span className="text-xs font-medium text-center text-primary">
          {badge.name}
        </span>
      </div>
    );
  };

  return (
    <>
      <Breadcrumb />
      <div className="flex-1 w-full flex flex-col gap-6 p-4 sm:p-6 max-w-2xl mx-auto">
        <Toaster position="bottom-center" reverseOrder={false} />
        <div className="grow">
          <header className="text-center mb-6">
            <h1 className="text-3xl font-bold">Account Page</h1>
          </header>

          <BadgeModal
            isOpen={modalIsOpen}
            onRequestClose={() => setModalIsOpen(false)}
            renderBadges={renderBadges}
          />

          <div className="mb-8">
            <div className="relative w-40 h-fit mx-auto mb-4">
              <img
                src={avatarPreview || "/assets/default_profile_img.png"}
                alt="Avatar Preview"
                className="rounded-full w-full h-full object-cover border-4 border-gray-200 dark:border-gray-700"
              />
              <Button
                variant="secondary"
                size="icon"
                className="absolute bottom-0 right-0 rounded-full p-2"
                onClick={() => fileInputRef.current?.click()}
              >
                <Camera className="h-5 w-5" />
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
              />
            </div>
            <div className="text-center mb-4">
              <h2 className="text-xl font-semibold mb-2">{user.username}</h2>
              <p className="text-sm text-gray-500">{user.email}</p>
            </div>
            <Link href="/protected/badges">
              <div className="flex items-center justify-start mb-4 gap-2 text-md text-foreground dark:text-primary">
                Badges
                <PlusCircle className="h-4 w-4" />
              </div>
            </Link>
            <div onClick={() => setModalIsOpen(true)}>
              {renderEquippedBadge()}
            </div>
          </div>

          <div className="space-y-6">
            <EditableInput
              value={user.username}
              onChange={(value) => handleSave("username", value)}
              label="Username"
              id="username"
              isEditable={true}
            />
            <EditableInput
              value={user.email}
              label="Email Address"
              id="email"
              isEditable={false}
            />
            <EditableInput
              value={user.bio || "Add your bio here"}
              onChange={(value) => handleSave("bio", value)}
              label="Your Bio - Brag a little 😊"
              id="bio"
              isEditable={true}
              type="textarea"
            />
            <EditableInput
              value={user.is_premium ? "Premium User" : "Free User"}
              label="Account Type"
              id="account-type"
              isEditable={false}
            />
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <Button
              className="flex-1"
              onClick={() =>
                (window.location.href = "/protected/account/statistics")
              }
            >
              <LineChart className="h-4 w-4 mr-2" />
              Personal Statistics
            </Button>
            <Button
              className="flex-1"
              variant={user.is_premium ? "outline" : "action"}
              onClick={handleAccountTypeChange}
            >
              {user.is_premium ? (
                "Downgrade to Free Account"
              ) : (
                <>
                  <Zap className="h-4 w-4 mr-2" />
                  Go Premium ($0.99)
                </>
              )}
            </Button>
          </div>
          <Button
            className="flex-2"
            variant={"ghost"}
            onClick={() => (window.location.href = "/protected/how-to-upgrade")}
          >
            <MessageCircleQuestion className="h-4 w-4 mr-2" />
            How to Upgrade
          </Button>
        </div>
      </div>
    </>
  );
}
