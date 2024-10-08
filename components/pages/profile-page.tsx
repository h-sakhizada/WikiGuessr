"use client";
import {
  editProfile,
  setProfileToFree,
  setProfileToPremium,
} from "@/actions/profile-actions";
import { Button } from "@/components/ui/button";
import { useProfile } from "@/hooks/useProfile";
import { useProfileSelectedBadges } from "@/hooks/useProfileBadge";
import { Profile } from "@/types";
import { Camera, LineChart, PlusCircle, Zap } from "lucide-react";
import { redirect } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import EditableInput from "../custom/EditableInput";
import LoadingSpinner from "../loading-spinner";
import Link from "next/link";

const convertToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};

export default function ProfileClientPage() {
  const { data: user, isLoading, refetch } = useProfile();
  const { data: badgesData } = useProfileSelectedBadges();
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (user) {
      setAvatarPreview(
        user.avatar?.trim() || "/assets/default_profile_img.png"
      );
    }
  }, [user]);

  if (isLoading) return <LoadingSpinner />;
  if (!user) return redirect("/sign-in");

  const handleSave = async (field: keyof Profile, value: string) => {
    if (!user || user[field] === value) return;

    try {
      const updatedData = { ...user, [field]: value };
      await editProfile(updatedData);
      toast.success(`${field} updated successfully!`);
      refetch();
    } catch (error) {
      toast.error(`Failed to update ${field}. Please try again.`);
    }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user?.id) return;

    try {
      const base64String = await convertToBase64(file);
      setAvatarPreview(base64String);
      await editProfile({ ...user, avatar: base64String });
      toast.success("Avatar updated successfully!");
      refetch();
    } catch (error) {
      toast.error("Failed to update avatar. Please try again.");
    }
  };

  const handleAccountTypeChange = async () => {
    try {
      if (user.is_premium) {
        await setProfileToFree();
        toast.success("Account downgraded to free successfully!");
      } else {
        await setProfileToPremium();
        toast.success("Account upgraded to premium successfully!");
      }
      refetch();
    } catch (error) {
      toast.error("Failed to change account type. Please try again.");
    }
  };

  const renderBadges = () => {
    if (!badgesData)
      return <div className="text-sm text-gray-500">No Badges</div>;

    const selectedBadgeIds = new Set(badgesData.meta?.map((m) => m.badge_id));

    return badgesData?.badges
      ?.filter((badge) => selectedBadgeIds.has(badge.id))
      .map((badge) => (
        <div
          key={badge.id}
          className="flex flex-col items-center p-2 bg-gray-100 dark:bg-gray-800 rounded-lg shadow-sm"
        >
          <img
            src={badge.icon ?? ""}
            className="w-10 h-10 mb-1"
            alt={badge.name}
          />
          <span className="text-xs font-medium text-center">{badge.name}</span>
        </div>
      ));
  };

  return (
    <div className="flex-1 w-full flex flex-col gap-6 p-4 sm:p-6 max-w-2xl mx-auto">
      <Toaster position="bottom-center" reverseOrder={false} />
      <div className="grow">
        <header className="text-center mb-6">
          <h1 className="text-3xl font-bold">Account Page</h1>
        </header>

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
            <h2 className="text-xl font-semibold mb-2">{user.username}</h2>
            <p className="text-sm text-gray-500">{user.email}</p>
          </div>
          <Link href="/protected/badges">
            <div className="flex items-center justify-start mb-4 gap-2 text-md text-foreground dark:text-primary">
              Badges
              <PlusCircle className="h-4 w-4" />
            </div>
          </Link>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 justify-center">
            {renderBadges()}
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
          variant={user.is_premium ? "outline" : "default"}
          onClick={handleAccountTypeChange}
        >
          {user.is_premium ? (
            "Downgrade to Free Account"
          ) : (
            <>
              <Zap className="h-4 w-4 mr-2" />
              Go Premium
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
