import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/utils/supabase/client";
import { Badge, UserBadges } from "@/types";
import { getBadgesForUser } from "@/actions/badge-actions";

const supabase = createClient();

// Fetch all badges
export function useAllBadges() {
  return useQuery<Badge[], Error>({
    queryKey: ["badges"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("badges")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });
}

// Add new badge
export function useAddBadge() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (badgeData: Partial<Badge>) => {
      const { data, error } = await supabase
        .from("badges")
        .insert([badgeData])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["badges"] });
    },
  });
}

// Update badge
export function useUpdateBadge() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      updates,
    }: {
      id: string;
      updates: Partial<Badge>;
    }) => {
      const { error } = await supabase
        .from("badges")
        .update(updates)
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["badges"] });
    },
  });
}

// Delete badge
export function useDeleteBadge() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      // First get the badge to check for an icon
      const { data: badge } = await supabase
        .from("badges")
        .select("icon")
        .eq("id", id)
        .single();

      // If there's an icon, delete it from storage
      if (badge?.icon) {
        const iconPath = new URL(badge.icon).pathname.split("/").pop();
        if (iconPath) {
          await supabase.storage.from("badges").remove([iconPath]);
        }
      }

      // Then delete the badge
      const { error } = await supabase.from("badges").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["badges"] });
    },
  });
}

// Upload badge icon
export function useUploadBadge() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ file, badgeId }: { file: File; badgeId: string }) => {
      // First upload the file
      const fileExt = file.name.split(".").pop();
      const fileName = `${badgeId}-${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("badges")
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Get the public URL
      const { data: publicUrl } = supabase.storage
        .from("badges")
        .getPublicUrl(fileName);

      // Update the badge with the new icon URL
      const { error: updateError } = await supabase
        .from("badges")
        .update({ icon: publicUrl.publicUrl })
        .eq("id", badgeId);

      if (updateError) throw updateError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["badges"] });
    },
  });
}

export function useUserSelectedBadges(uuid?: string) {
  return useQuery<UserBadges | null, Error>({
    queryKey: ["badge", uuid],
    queryFn: async () => {
      const badges = await getBadgesForUser(uuid);
      if (!badges) {
        return null;
      }
      return badges;
    },
    retry: false, // Don't retry if no user is found
  });
}
