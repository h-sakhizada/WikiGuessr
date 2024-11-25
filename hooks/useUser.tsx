"use client";

import { useQuery } from "@tanstack/react-query";
import { getAllUsers, getUser } from "@/actions/user-actions";
import { User } from "@/types";

export function useUser(uuid?: string) {
  return useQuery<User | null, Error>({
    queryKey: ["user", uuid],
    queryFn: async () => {
      const user = await getUser(uuid);
      if (!user?.id) {
        return null;
      }
      return user;
    },
    retry: false, // Don't retry if no user is found
  });
}

export const useAllUsers = () => {
  const { data, isLoading, error, refetch } = useQuery<User[] | null, Error>({
    queryKey: ["allUsers"],
    queryFn: async () => {
      const users = await getAllUsers();
      if (!users || users.length === 0) {
        return null;
      }
      return users;
    },
    retry: false,
  });

  return {
    data,
    isLoading,
    error,
    refetch,
  };
};
