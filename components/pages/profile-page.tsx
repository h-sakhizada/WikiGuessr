"use client";
import { useProfile } from "@/hooks/useProfile";
import { getProfileSelectedBadges } from "@/hooks/useProfileBadge";
import { redirect } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	editProfile,
	setProfileToFree,
	setProfileToPremium,
} from "@/actions/profile-actions";
import { PencilIcon, CheckIcon, Zap, LineChart, List } from "lucide-react";
import LoadingSpinner from "../loading-spinner";
import toast, { Toaster } from "react-hot-toast";

// Helper function to convert file to Base64
const convertToBase64 = (file: File) => {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.readAsDataURL(file);
		reader.onload = () => resolve(reader.result);
		reader.onerror = (error) => reject(error);
	});
};

export default function ProfileClientPage() {
	const user = useProfile();
  const badges = getProfileSelectedBadges();
	const [isEditingUsername, setIsEditingUsername] = useState(false);
  const [BadgeArray, setBadgeArray] = useState([]);
  const [BadgeDataArray, setBadgeDataArray] = useState([]);
  const [isEditingBio, setIsEditingBio] = useState(false);
	const [usernameUpdate, setUsernameUpdate] = useState("");
  const [BioUpdate, setBioUpdate] = useState("");
	const [avatarBase64, setAvatarBase64] = useState<string | null>(null);
	const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
	const fileInputRef = useRef<HTMLInputElement | null>(null); // Properly type the ref

	useEffect(() => {
		// Load the avatar from the user profile data when available
		if (user.data) {
			// Check if user.data.avatar is a valid image URL or not
			const avatarUrl =
				user.data.avatar && user.data.avatar.trim() !== ""
					? user.data.avatar
					: "/assets/default_profile_img.png";
			setAvatarPreview(avatarUrl);

      console.log(badges)
      //console.log(user)
		}
	}, [user.data]);

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

  const getSelectedBadgeImages = () => {


  }

  const handleEditBio = () => {
		// if (!user.data) {
		// 	toast.error("Failed to update bio. Please try again.", {
		// 		iconTheme: {
		// 			primary: "red",
		// 			secondary: "white",
		// 		},
		// 	});
		// 	return;
		// }
		// //setBioUpdate(user.data.username);
		setIsEditingBio(true);
	};

	const handleSaveUsername = async () => {
		if (!user.data || usernameUpdate === user.data.username) {
			setIsEditingUsername(false);
			return;
		}

		try {
			const updatedData = { ...user.data, username: usernameUpdate };
			await editProfile(updatedData);
			toast.success("Username updated successfully!", {
				iconTheme: { primary: "black", secondary: "white" },
			});
			setIsEditingUsername(false);
			user.refetch();
		} catch (error) {
			toast.error("Failed to update username. Please try again.", {
				iconTheme: { primary: "red", secondary: "white" },
			});
		}
	};

  const handleSaveBio = async () => {
		// if (!user.data || usernameUpdate === user.data.username) {
			setIsEditingBio(false);
		// 	return;
		// }

		// try {
		// 	const updatedData = { ...user.data, username: usernameUpdate };
		// 	await editProfile(updatedData);
		// 	toast.success("Username updated successfully!", {
		// 		iconTheme: { primary: "black", secondary: "white" },
		// 	});
		// 	setIsEditingUsername(false);
		// 	user.refetch();
		// } catch (error) {
		// 	toast.error("Failed to update username. Please try again.", {
		// 		iconTheme: { primary: "red", secondary: "white" },
		// 	});
		// }
	};

	// Handle avatar upload and Base64 conversion
	const handleAvatarChange = async (
		e: React.ChangeEvent<HTMLInputElement>
	) => {
		const files = e.target.files;
		if (files && files.length > 0) {
			const file = files[0];
			const base64String = (await convertToBase64(file)) as string;
			setAvatarBase64(base64String);
			setAvatarPreview(base64String); // Show preview of uploaded image

			try {
				if (!user.data?.id) {
					throw new Error("User ID is missing");
				}

				const updatedData = { ...user.data, avatar: base64String };
				await editProfile(updatedData); // Update profile with new avatar
				toast.success("Avatar updated successfully!", {
					iconTheme: { primary: "black", secondary: "white" },
				});
				user.refetch();
			} catch (error) {
				toast.error("Failed to update avatar. Please try again.", {
					iconTheme: { primary: "red", secondary: "white" },
				});
			}
		}
	};

	// Trigger file input when clicking on avatar image
	const handleImageClick = () => {
		if (fileInputRef.current) {
			fileInputRef.current.click();
		}
	};

	const handleUpgradeToPremium = async () => {
		try {
			await setProfileToPremium();
			toast.success("Account upgraded to premium successfully!", {
				iconTheme: { primary: "black", secondary: "white" },
			});
			user.refetch();
		} catch (error) {
			toast.error(
				"Failed to upgrade account to premium. Please try again.",
				{
					iconTheme: { primary: "red", secondary: "white" },
				}
			);
		}
	};

	const handleDowngradeToFree = async () => {
		try {
			await setProfileToFree();
			toast.success("Account downgraded to free successfully!", {
				iconTheme: { primary: "black", secondary: "white" },
			});
			user.refetch();
		} catch (error) {
			toast.error(
				"Failed to downgrade account to free. Please try again.",
				{
					iconTheme: { primary: "red", secondary: "white" },
				}
			);
		}
	};

	return (

    

		<div className="flex-1 w-full flex flex-col gap-3 p-3 sm:p-4 max-w-md mx-auto">
			<Toaster position="bottom-center" reverseOrder={false} />
			<div className="grow">
				<header className="text-center mb-4">
					<h1 className="text-2xl font-bold">Account Page</h1>
				</header>

				<div className="text-center mb-4 flex items-center">

        <div>
          <img src={BadgeArray[0] || "/assets/NoBadge.png"} className="w-20 h-20 m-2 ml-0" />
          <img src={BadgeArray[1] || "/assets/NoBadge.png"} className="w-20 h-20 m-2 ml-0" />
          <img src={BadgeArray[2] || "/assets/NoBadge.png"} className="w-20 h-20 m-2 ml-0" />
        </div>

					<img
						src={avatarPreview || "/assets/default_profile_img.png"}
						alt="Avatar Preview"
						className="rounded-full w-40 h-40 mx-auto m-2 object-cover cursor-pointer"
						onClick={handleImageClick} // Trigger file input when image is clicked
					/>
					<input
						ref={fileInputRef}
						type="file"
						accept="image/*"
						onChange={handleAvatarChange}
						className="hidden" // Hide the file input
					/>

        <div>
          <img src={BadgeArray[3] || "/assets/NoBadge.png"} className="w-20 h-20 m-2 mr-0" />
          <img src={BadgeArray[4] || "/assets/NoBadge.png"} className="w-20 h-20 m-2 mr-0" />
          <img src={BadgeArray[5] || "/assets/NoBadge.png"} className="w-20 h-20 m-2 mr-0" />
        </div>

				</div>


        

        

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
									onChange={(e) =>
										setUsernameUpdate(e.target.value)
									}
									className="flex-grow border-2 border-black dark:border-white bg-transparent text-gray-800 dark:text-gray-200 p-2 rounded-md"
								/>
							) : (
								<p className="flex-grow text-lg border-2 border-black dark:border-white bg-transparent text-gray-800 dark:text-gray-200 p-2 rounded-md">
									{user.data.username}
								</p>
							)}
							<Button
								variant="ghost"
								size="icon"
								onClick={
									isEditingUsername
										? handleSaveUsername
										: handleEditUsername
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
						<p className="flex-grow text-lg border-2 border-black dark:border-white bg-transparent text-gray-800 dark:text-gray-200 p-2 rounded-md">
							{user.data.email}
						</p>
					</div>


          <div className="space-y-2">
						<label
							htmlFor="bio"
							className="block text-sm font-medium text-gray-700 dark:text-gray-300"
						>
							Your Bio  --  Brag a little
						</label>
						<div className="flex items-center space-x-2">
							{isEditingBio ? (
								<Input
									id="bio"
									type="text"
									value={BioUpdate}
									onChange={(e) =>
										setBioUpdate(e.target.value)
									}
									className="h-40 flex-grow border-2 border-black dark:border-white bg-transparent text-gray-800 dark:text-gray-200 p-2 rounded-md"
								/>
							) : (
								<p className="h-40 flex-grow text-lg border-2 border-black dark:border-white bg-transparent text-gray-800 dark:text-gray-200 p-2 rounded-md">
									{/* {user.data.username} */}
                  PLACEHOLDER
								</p>
							)}
							<Button
								variant="ghost"
								size="icon"
								onClick={
									isEditingBio
										? handleSaveBio
										: handleEditBio
								}
							>
								{isEditingBio ? (
									<CheckIcon className="h-4 w-4" />
								) : (
									<PencilIcon className="h-4 w-4" />
								)}
							</Button>
						</div>
					</div>


					<div className="space-y-2">
						<label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
							Account Type
						</label>
						<p className="flex-grow text-lg border-2 border-black dark:border-white bg-transparent text-gray-800 dark:text-gray-200 p-2 rounded-md">
							{user.data.is_premium
								? "Premium User"
								: "Free User"}
						</p>
					</div>
				</div>
			</div>
			<Button
				onClick={() => (window.location.href = "/protected/statistics")}
			>
				<LineChart className="h-4 w-4 mr-2" />
				Personal Statistics
			</Button>
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
