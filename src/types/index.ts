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
  startTime: string;
  endTime: string;
  status: ElectionStatus;
  publicResults: boolean;
  createdBy: string;
  startedAt?: string;
  closedAt?: string;
  createdAt: string;
  candidateCount?: number;
  hasVoted?: boolean;
}

export interface Candidate {
  id: string;
  electionId: string;
  displayName: string;
  manifesto: string;
  photoUrl?: string;
  voteCount?: number;
  percentage?: number;
}

export interface Vote {
  id: string;
  electionId: string;
  candidateId: string;
  voterId: string;
  createdAt: string;
}

export interface ElectionResult {
  election: Election;
  candidates: (Candidate & { voteCount: number; percentage: number })[];
  totalVotes: number;
  winners: Candidate[];
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
