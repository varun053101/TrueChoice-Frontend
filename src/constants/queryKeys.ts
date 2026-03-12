export const QUERY_KEYS = {
    // Voter
    voterElections: ['voter', 'elections'] as const,
    voterAllElections: ['voter', 'elections', 'all'] as const,
    voterBallot: (id: string) => ['voter', 'ballot', id] as const,
    voterResults: (id: string) => ['voter', 'results', id] as const,
    voterCandidates: (id: string) => ['voter', 'candidates', id] as const,
    // Admin
    adminElections: ['admin', 'elections'] as const,
    adminElection: (id: string) => ['admin', 'election', id] as const,
    adminCandidates: (id: string) => ['admin', 'candidates', id] as const,
    adminResults: (id: string) => ['admin', 'results', id] as const,
    // Superadmin
    superadminAdmin: ['superadmin', 'admin'] as const,
    superadminUsers: ['superadmin', 'users'] as const,
    // Auth
    userProfile: ['auth', 'profile'] as const,
};
