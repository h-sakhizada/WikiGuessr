"use client";
import {
  editProfile,
  setProfileToFree,
  setSelectedBadge,
  getSelectedBadge,
} from "@/actions/profile-actions";
import { Button } from "@/components/ui/button";
import { useProfile } from "@/hooks/useProfile";
import { useProfileSelectedBadges } from "@/hooks/useProfileBadge";
import { Profile } from "@/types";
import { Camera, LineChart, MessageCircleQuestion, PlusCircle, Zap } from "lucide-react";
import { redirect } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import EditableInput from "../../../../components/custom/EditableInput";
import LoadingSpinner from "../../../../components/loading-spinner";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import BadgeModal from "../../../../components/ui/badgeModal";

export default function ProfileClientPage() {
  const { data: profile, isLoading, refetch } = useProfile();
  const { data: badgesData } = useProfileSelectedBadges();
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
    if (profile) {
      setAvatarPreview(
        profile.avatar?.trim() || "/assets/default_profile_img.png"
      );
    }

    fetchEquippedBadge();
  }, [profile]);

  if (isLoading) return <LoadingSpinner />;
  if (!profile) return redirect("/sign-in");

  const handleSave = async (field: keyof Profile, value: string) => {
    if (!profile || profile[field] === value) return;

    try {
      const updatedData = { ...profile, [field]: value };
      await editProfile(updatedData);
      toast.success(`${field} updated successfully!`);
      refetch();
    } catch (error) {
      toast.error(`Failed to update ${field}. Please try again.`);
    }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e?.target?.files?.[0];
    if (!file || !profile?.user_id) return;

    const supabase = createClient();

    // Define file path using user ID for RLS
    const fileExt = file.name.split(".").pop();
    const fileName = `${profile.user_id}/${Date.now()}.${fileExt}`;

    await toast.promise(
      (async () => {
        try {
          // First, try to delete the old file if it exists
          if (profile.avatar) {
            try {
              const oldFilePath = new URL(profile.avatar).pathname
                .split("/")
                .pop();
              if (oldFilePath) {
                await supabase.storage
                  .from("profile_pictures")
                  .remove([`${profile.user_id}/${oldFilePath}`]);
              }
            } catch (error) {
              console.log("No old file to delete or error deleting:", error);
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

          // Update user profile with new avatar URL
          await editProfile({ ...profile, avatar: publicUrl });

          // Update local preview
          setAvatarPreview(publicUrl);

          // Refresh profile data
          await refetch();

          return publicUrl;
        } catch (error) {
          console.error("Error in upload process:", error);
          throw error;
        }
      })(),
      {
        loading: "Uploading profile picture...",
        success: "Profile picture updated successfully!",
        error: (error) =>
          `Upload failed: ${error.message || "Please try again"}`,
      }
    );
  };

  const handleAccountTypeChange = async () => {
    try {
      if (profile.is_premium) {
        await setProfileToFree();
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
    console.log("Selected Bagde: " + badgeId);
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
        <span className="text-xs font-medium text-center text-white">
          {badge.name}
        </span>
      </div>
    );
  };

  return (
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
          <div className="relative w-40 h-40 mx-auto mb-4">
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
            <h2 className="text-xl font-semibold mb-2">{profile.username}</h2>
            <p className="text-sm text-gray-500">{profile.email}</p>
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
            value={profile.username}
            onChange={(value) => handleSave("username", value)}
            label="Username"
            id="username"
            isEditable={true}
          />
          <EditableInput
            value={profile.email}
            label="Email Address"
            id="email"
            isEditable={false}
          />
          <EditableInput
            value={profile.bio || "Add your bio here"}
            onChange={(value) => handleSave("bio", value)}
            label="Your Bio - Brag a little 😊"
            id="bio"
            isEditable={true}
            type="textarea"
          />
          <EditableInput
            value={profile.is_premium ? "Premium User" : "Free User"}
            label="Account Type"
            id="account-type"
            isEditable={false}
          />
        </div>
      </div>
      <div className="flex flex-col sm:flex-row gap-4">
        <Button
          className="flex-1"
          onClick={() => (window.location.href = "/protected/statistics")}
        >
          <LineChart className="h-4 w-4 mr-2" />
          Personal Statistics
        </Button>
        <Button
          className="flex-1"
          variant={profile.is_premium ? "outline" : "default"}
          onClick={handleAccountTypeChange}
        >
          {profile.is_premium ? (
            "Downgrade to Free Account"
          ) : (
            <>
              <Zap className="h-4 w-4 mr-2" />
              Go Premium
            </>
          )}
        </Button>
        <Button
          className="flex-2"
          onClick={() => (window.location.href = "/protected/how-to-upgrade")}
        >
          <MessageCircleQuestion className="h-4 w-4 mr-2" />
          How to Upgrade
        </Button>
      </div>
    </div>
  );
}
