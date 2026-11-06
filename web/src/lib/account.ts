import { useQuery } from "@tanstack/react-query";
import { gql, getToken } from "./api";

export type Me = {
  id: string;
  name: string;
  email: string;
  verified: boolean;
  walletBalanceCents: string;
};

export const ME_QUERY = /* GraphQL */ `
  query Me {
    me { id name email verified walletBalanceCents }
  }
`;

// Current signed-in user (null when logged out). Re-fetches on window focus
// so wallet balance / verification status stay fresh after mutations.
export function useMe() {
  const hasToken = typeof window !== "undefined" && !!getToken();
  return useQuery({
    queryKey: ["me"],
    queryFn: () => gql<{ me: Me | null }>(ME_QUERY),
    enabled: hasToken,
  });
}
