/**
 * Centralized React Query hooks for all data fetching.
 * - Data is cached and NOT re-fetched on every navigation.
 * - staleTime: how long cached data is considered fresh (no re-fetch during this window).
 * - gcTime (garbage collect): how long to keep inactive cache in memory.
 * - Refetch only on: window focus (for critical live data), explicit invalidation, or manual refresh.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { electionsAPI, adminAPI, superadminAPI, authAPI } from '@/services/api';
import { QUERY_KEYS } from '@/constants/queryKeys';

// ============================================─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normaliseElections(raw: any): any[] {
  let list: any[] = [];
  if (Array.isArray(raw)) list = raw;
  else if (Array.isArray(raw?.elections)) list = raw.elections;
  else if (Array.isArray(raw?.data?.elections)) list = raw.data.elections;
  else if (Array.isArray(raw?.data)) list = raw.data;
  return list.map((e: any) => ({ ...e, id: String(e._id || e.id || ''), hasVoted: e.hasVoted || false }));
}

// ─────────────────────────────────────────────
// VOTER HOOKS
// ─────────────────────────────────────────────

/** Active + scheduled elections for current voter (from /user/elections/active) */
export function useVoterElections() {
  return useQuery({
    queryKey: QUERY_KEYS.voterElections,
    queryFn: async () => {
      const res = await electionsAPI.getActive();
      // After API normalization this is the inner
      // `{ scheduled, ongoing }` payload.
      const payload = res || {};
      const scheduled: any[] = Array.isArray(payload.scheduled) ? payload.scheduled : [];
      const ongoing: any[] = Array.isArray(payload.ongoing) ? payload.ongoing : [];
      // Merge: ongoing first so they appear at top
      const all = [...ongoing, ...scheduled];
      return all.map((e: any) => ({ ...e, id: String(e._id || e.id || '') }));
    },
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
    refetchOnWindowFocus: true,
    retry: 2,
  });
}

/** ALL elections including closed (with published results) — voter Results list */
export function useVoterAllElections() {
  return useQuery({
    queryKey: QUERY_KEYS.voterAllElections,
    queryFn: async () => {
      const res = await electionsAPI.getAll();
      // After normalization this is typically `{ elections: [...] }`
      // but we keep the defensive shape handling.
      const payload = res || {};
      const list: any[] = Array.isArray(payload)
        ? payload
        : Array.isArray((payload as any).elections)
          ? (payload as any).elections
          : Array.isArray((payload as any).data)
            ? (payload as any).data
            : [];
      return list.map((e: any) => ({ ...e, id: String(e._id || e.id || '') }));
    },
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
    refetchOnWindowFocus: true,
    retry: 2,
  });
}

/** Single election ballot — VotingPage */
export function useVoterBallot(electionId: string | undefined) {
  return useQuery({
    queryKey: QUERY_KEYS.voterBallot(electionId ?? ''),
    queryFn: async () => {
      const res = await electionsAPI.getBallot(electionId!);
      // After normalization this is the inner
      // `{ election, candidates }` payload.
      return res;
    },
    enabled: !!electionId,
    staleTime: 20 * 1000,
    gcTime: 5 * 60 * 1000,
    retry: 1,
  });
}

/** Election results (voter-facing, only published) — ResultsPage */
export function useVoterResults(electionId: string | undefined) {
  return useQuery({
    queryKey: QUERY_KEYS.voterResults(electionId ?? ''),
    queryFn: async () => {
      const res = await electionsAPI.getResults(electionId!);
      // After normalization this is the inner
      // `{ election, totalVotes, results, winners }` payload.
      return res;
    },
    enabled: !!electionId,
    staleTime: 2 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 1,
  });
}

/** Candidates for a voter-facing election */
export function useVoterCandidates(electionId: string | undefined) {
  return useQuery({
    queryKey: QUERY_KEYS.voterCandidates(electionId ?? ''),
    queryFn: async () => {
      const res = await electionsAPI.getCandidates(electionId!);
      // After normalization this is typically `{ candidate: [...] }`.
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const payload = res || {};
      const list: any[] =
        (payload as any).candidate ||
        (payload as any).candidates ||
        (Array.isArray(payload) ? payload : []);
      return list.map((c: any) => ({ ...c, id: String(c._id || c.id || '') }));
    },
    enabled: !!electionId,
    staleTime: 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 1,
  });
}

// ─────────────────────────────────────────────
// ADMIN HOOKS
// ─────────────────────────────────────────────

/** All elections list — Admin Dashboard & Elections list */
export function useAdminElections() {
  return useQuery({
    queryKey: QUERY_KEYS.adminElections,
    queryFn: async () => {
      const res = await adminAPI.getElections();
      return normaliseElections(res);
    },
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
    refetchOnWindowFocus: true,
    retry: 2,
  });
}

/** Single election detail — ManageElection page */
export function useAdminElection(electionId: string | undefined) {
  return useQuery({
    queryKey: QUERY_KEYS.adminElection(electionId ?? ''),
    queryFn: async () => {
      const res = await adminAPI.getElection(electionId!);
      // After normalization this is the inner
      // `{ election, stats, candidates }` payload.
      return res;
    },
    enabled: !!electionId,
    staleTime: 15 * 1000,
    gcTime: 5 * 60 * 1000,
    refetchOnWindowFocus: true,
    retry: 1,
  });
}

/** Admin candidates for an election */
export function useAdminCandidates(electionId: string | undefined) {
  return useQuery({
    queryKey: QUERY_KEYS.adminCandidates(electionId ?? ''),
    queryFn: async () => {
      const res = await adminAPI.getCandidates(electionId!);
      // After normalization this is typically
      // `{ election, totalCandidates, candidate: [...] }`.
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const payload = res || {};
      const list: any[] =
        (payload as any).candidate ||
        (payload as any).candidates ||
        [];
      return list.map((c: any) => ({
        ...c,
        id: c._id || c.id,
        // Backend admin endpoints return 'name'; normalise to displayName for UI consistency
        displayName: c.displayName || c.name || '',
      }));
    },
    enabled: !!electionId,
    staleTime: 15 * 1000,
    gcTime: 5 * 60 * 1000,
    retry: 1,
  });
}

/** Admin election results */
export function useAdminResults(electionId: string | undefined, enabled: boolean = true) {
  return useQuery({
    queryKey: QUERY_KEYS.adminResults(electionId ?? ''),
    queryFn: async () => {
      const res = await adminAPI.getElectionResults(electionId!);
      // After normalization this is the inner
      // `{ totalVotes, results: [...] }` payload.
      return res;
    },
    enabled: !!electionId && enabled,
    staleTime: 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 1,
  });
}

// ─────────────────────────────────────────────
// SUPERADMIN HOOKS
// ─────────────────────────────────────────────

export function useSuperadminAdmin() {
  return useQuery({
    queryKey: QUERY_KEYS.superadminAdmin,
    queryFn: async () => {
      const res = await superadminAPI.getCurrentAdmin();
      return res;
    },
    staleTime: 60 * 1000,
    gcTime: 5 * 60 * 1000,
    retry: 1,
  });
}

export function useSuperadminUsers() {
  return useQuery({
    queryKey: QUERY_KEYS.superadminUsers,
    queryFn: async () => {
      const res = await superadminAPI.getUsers();
      // After normalization this is typically `{ users: [...] }`.
      const payload = res || {};
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const list: any[] = payload.users || payload.admins || (Array.isArray(payload) ? payload : []);
      return list.map((u: any) => ({ ...u, id: u._id || u.id }));
    },
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
    retry: 1,
  });
}

// ─────────────────────────────────────────────
// AUTH HOOK
// ─────────────────────────────────────────────

export function useUserProfile() {
  return useQuery({
    queryKey: QUERY_KEYS.userProfile,
    queryFn: async () => {
      const res = await authAPI.getCurrentUser();
      // Returns the inner `{ user }` payload or the user object itself.
      return res;
    },
    staleTime: 5 * 60 * 1000,   // profile data is very stable
    gcTime: 30 * 60 * 1000,
    retry: 1,
  });
}

// ─────────────────────────────────────────────
// MUTATION HELPERS (invalidation after mutations)
// ─────────────────────────────────────────────

/** Returns helpers to invalidate relevant caches after mutations */
export function useQueryInvalidation() {
  const qc = useQueryClient();

  return {
    invalidateAdminElections: () => qc.invalidateQueries({ queryKey: QUERY_KEYS.adminElections }),
    invalidateAdminElection: (id: string) => qc.invalidateQueries({ queryKey: QUERY_KEYS.adminElection(id) }),
    invalidateAdminCandidates: (id: string) => qc.invalidateQueries({ queryKey: QUERY_KEYS.adminCandidates(id) }),
    invalidateVoterElections: () => qc.invalidateQueries({ queryKey: QUERY_KEYS.voterElections }),
    invalidateSuperadmin: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.superadminAdmin });
      qc.invalidateQueries({ queryKey: QUERY_KEYS.superadminUsers });
    },
  };
}

// ─────────────────────────────────────────────
// CAST VOTE MUTATION
// ─────────────────────────────────────────────
export function useCastVote(electionId: string | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ candidateId }: { candidateId: string }) =>
      electionsAPI.castVote(electionId!, candidateId),
    onSuccess: () => {
      // Invalidate elections so hasVoted state updates everywhere
      if (electionId) {
        qc.invalidateQueries({ queryKey: QUERY_KEYS.voterBallot(electionId) });
      }
      qc.invalidateQueries({ queryKey: QUERY_KEYS.voterElections });
    },
  });
}
