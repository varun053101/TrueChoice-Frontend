import type { Election, Candidate } from '@/types';

export const mockElections: Election[] = [
  {
    id: '1',
    title: 'CSE Club President Election 2025',
    positionName: 'President',
    description: 'Annual election for the Computer Science and Engineering club president position. The president will lead all club activities and represent students.',
    startTime: '2024-12-01T09:00:00Z',
    endTime: '2024-12-05T18:00:00Z',
    status: 'ongoing',
    publicResults: false,
    createdBy: '2',
    startedAt: '2024-12-01T09:00:00Z',
    createdAt: '2024-11-25T10:00:00Z',
  },
  {
    id: '2',
    title: 'Student Council Secretary Election',
    positionName: 'Secretary',
    description: 'Election for the student council secretary position. Responsible for maintaining records and communications.',
    startTime: '2024-12-10T09:00:00Z',
    endTime: '2024-12-12T18:00:00Z',
    status: 'scheduled',
    publicResults: false,
    createdBy: '2',
    createdAt: '2024-11-28T14:00:00Z',
  },
  {
    id: '3',
    title: 'Cultural Fest Coordinator Election',
    positionName: 'Coordinator',
    description: 'Select the coordinator for the annual cultural festival. Will be responsible for organizing and managing all cultural events.',
    startTime: '2024-11-20T09:00:00Z',
    endTime: '2024-11-25T18:00:00Z',
    status: 'closed',
    publicResults: true,
    createdBy: '3',
    startedAt: '2024-11-20T09:00:00Z',
    closedAt: '2024-11-25T18:00:00Z',
    createdAt: '2024-11-15T10:00:00Z',
  },
  {
    id: '4',
    title: 'Sports Club Captain Election',
    positionName: 'Captain',
    description: 'Election for the sports club captain. Lead the college sports teams and organize inter-college tournaments.',
    startTime: '2024-12-15T09:00:00Z',
    endTime: '2024-12-17T18:00:00Z',
    status: 'draft',
    publicResults: false,
    createdBy: '2',
    createdAt: '2024-12-01T10:00:00Z',
  },
];

export const mockCandidates: Candidate[] = [
  // CSE Club President Election
  {
    id: 'c1',
    electionId: '1',
    displayName: 'Priya Sharma',
    manifesto: 'I will introduce more coding bootcamps, hackathons, and industry connects. My goal is to make our club the most active tech community on campus.',
    photoUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop&crop=face',
  },
  {
    id: 'c2',
    electionId: '1',
    displayName: 'Rahul Verma',
    manifesto: 'Focus on practical skills, mentorship programs, and creating opportunities for juniors. Together we can build a stronger CSE community.',
    photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face',
  },
  {
    id: 'c3',
    electionId: '1',
    displayName: 'Ananya Patel',
    manifesto: 'Innovation and inclusion are my priorities. I plan to start AI/ML workshops and ensure every student gets hands-on project experience.',
    photoUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop&crop=face',
  },
  // Student Council Secretary
  {
    id: 'c4',
    electionId: '2',
    displayName: 'Vikram Singh',
    manifesto: 'Transparency and organization are key. I will digitize all records and ensure timely communication with all students.',
    photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop&crop=face',
  },
  {
    id: 'c5',
    electionId: '2',
    displayName: 'Meera Krishnan',
    manifesto: 'Efficient administration and student advocacy. I promise to be the voice that connects students to the council effectively.',
    photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop&crop=face',
  },
  // Cultural Fest Coordinator (closed - with results)
  {
    id: 'c6',
    electionId: '3',
    displayName: 'Arjun Nair',
    manifesto: 'Bringing creativity and culture together. My vision is an inclusive fest that celebrates diversity.',
    photoUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop&crop=face',
    voteCount: 245,
    percentage: 42.5,
  },
  {
    id: 'c7',
    electionId: '3',
    displayName: 'Sanya Gupta',
    manifesto: 'Innovation in events, memorable experiences. Let\'s make this the best cultural fest ever!',
    photoUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&h=200&fit=crop&crop=face',
    voteCount: 198,
    percentage: 34.3,
  },
  {
    id: 'c8',
    electionId: '3',
    displayName: 'Karan Malhotra',
    manifesto: 'Experience and dedication. Having organized multiple events, I know what makes a great fest.',
    photoUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&h=200&fit=crop&crop=face',
    voteCount: 134,
    percentage: 23.2,
  },
];

// Track which elections a voter has voted in (by voter ID)
export const voterElectionStatus: Record<string, string[]> = {
  '1': ['3'], // Voter 1 has voted in election 3
};

// Eligible voters per election (by SRN)
export const eligibleVoters: Record<string, string[]> = {
  '1': ['R22CS001', 'R22CS002', 'R22CS003', 'R21CS001', 'R21CS002'],
  '2': ['R22CS001', 'R22CS002', 'R21CS001', 'R21CS002', 'R20CS001'],
  '3': ['R22CS001', 'R22CS002', 'R21CS001', 'R21CS002', 'R20CS001'],
  '4': ['R22CS001', 'R22CS002'],
};
