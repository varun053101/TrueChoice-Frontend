export type UserRole = 'voter' | 'admin' | 'superadmin';

export type ElectionStatus = 'draft' | 'scheduled' | 'ongoing' | 'closed';

export interface User {
  id: string;
  email: string;
  srn: string;
  name: string;
  role: UserRole;
  createdAt: string;
}

export interface Election {
  id: string;
  title: string;
  positionName: string;
  description?: string;
  startTime?: string;
  endTime?: string;
  status: ElectionStatus;
  /** Returned by GET /admin/elections/:id as `publishResults` */
  publishResults?: boolean;
  /** Legacy alias — some responses use publicResults; prefer publishResults */
  publicResults?: boolean;
  createdBy?: string;
  startedAt?: string;
  closedAt?: string;
  createdAt: string;
  candidateCount?: number;
  eligibleCount?: number;
  hasVoted?: boolean;
}

/** Candidate on a voter ballot — GET /user/elections/:id/ballot */
export interface Candidate {
  id: string;
  electionId?: string;
  /** Voter-facing ballot uses displayName */
  displayName: string;
  manifesto?: string;
  photoUrl?: string;
  voteCount?: number;
  percentage?: number;
}

/** Candidate from admin endpoints — GET /admin/elections/:id/candidates */
export interface AdminCandidate {
  id: string;
  electionId: string;
  /** Admin endpoints return 'name' (not displayName) */
  name: string;
  displayName: string; // normalised from name by useAdminCandidates hook
  manifesto?: string;
  photoUrl?: string;
  createdAt: string;
}

/** Response from GET /user/elections/active */
export interface ActiveElectionsResponse {
  scheduled: Election[];
  ongoing: Election[];
}

export interface Vote {
  id: string;
  electionId: string;
  candidateId: string;
  voterId: string;
  createdAt: string;
}

export interface ElectionResult {
  election: Pick<Election, 'id' | 'title' | 'positionName'>;
  totalVotes: number;
  results: {
    candidateId: string;
    displayName: string;
    votes: number;
    percentage: number;
  }[];
  winners: { candidateId: string; displayName: string }[];
}

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
  srn: string;
}
