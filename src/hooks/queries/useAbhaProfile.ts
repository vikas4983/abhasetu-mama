/**
 * @file        useAbhaProfile.ts
 * @description React Query hook for fetching and caching ABHA profile data
 * @module      auth/queries
 * @layer       hook
 * @author      Platform Team
 * @created     2026-06-21
 * @modified    2026-06-21
 */

import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { AbhaAccount } from '../../store/slices/authSlice';

// A mock fetch function representing an ABDM gateway request for a profile
const fetchAbhaProfile = async (abhaAddress: string, token: string): Promise<AbhaAccount> => {
  const { data } = await axios.get(`/api/abdm/profile`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    params: {
      abhaAddress,
    },
  });
  return data;
};

/**
 * @description Hook to fetch an ABHA profile with caching and automatic refresh
 * @param abhaAddress - The active user's ABHA address or ID
 * @param token - Secure authorization token
 */
export function useAbhaProfile(abhaAddress: string | null, token: string | null) {
  return useQuery<AbhaAccount, Error>({
    queryKey: ['abhaProfile', abhaAddress],
    queryFn: () => fetchAbhaProfile(abhaAddress!, token!),
    enabled: !!abhaAddress && !!token,
    staleTime: 5 * 60 * 1000, // Profile data is fresh for 5 minutes
    gcTime: 30 * 60 * 1000,   // Cache is garbage collected after 30 minutes
  });
}
