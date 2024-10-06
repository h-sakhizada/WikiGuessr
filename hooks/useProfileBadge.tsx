// "use client";

// import { useQuery } from "@tanstack/react-query";
// import { getBadgesForUser, UserBadges } from "@/actions/badge-actions";



// export function getProfileSelectedBadges(uuid?: string) {
//   return useQuery<UserBadges | null, Error>({
//     queryKey: ["badge", uuid],
//     queryFn: async () => {
//       const Badges = await getBadgesForUser(uuid);
//       if (!Badges) {
//         console.log("No badges found for user:", uuid);
//       }
// ``
//       console.log(Badges)
//       return Badges;
//     },
//     retry: false, // Don't retry if no profile is found
//   });
// }
