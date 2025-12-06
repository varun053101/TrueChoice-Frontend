# TrueChoice Frontend - Instructions & API Documentation

## 📁 Project Structure

```
src/
├── components/
│   ├── ui/                    # Shadcn UI components
│   ├── DashboardLayout.tsx    # Main layout with sidebar
│   ├── NavLink.tsx            # Navigation link component
│   ├── ProtectedRoute.tsx     # Auth route protection
│   └── StatusBadge.tsx        # Election status badges
├── contexts/
│   └── AuthContext.tsx        # Authentication context & state
├── data/
│   └── mockData.ts            # Mock data (replace with API calls)
├── pages/
│   ├── admin/
│   │   ├── Dashboard.tsx      # Admin dashboard
│   │   ├── Elections.tsx      # Election management
│   │   ├── CreateElection.tsx # Create new election
│   │   └── ManageElection.tsx # Edit election details
│   ├── voter/
│   │   ├── Dashboard.tsx      # Voter dashboard
│   │   ├── Elections.tsx      # Available elections
│   │   ├── VotingPage.tsx     # Cast vote page
│   │   ├── ResultsPage.tsx    # View results
│   │   ├── Results.tsx        # Results list
│   │   └── Profile.tsx        # Voter profile
│   ├── Index.tsx              # Smart redirect based on auth
│   ├── Landing.tsx            # Landing page
│   ├── Login.tsx              # Login page
│   ├── Register.tsx           # Registration page
│   └── NotFound.tsx           # 404 page
├── services/
│   └── api.ts                 # API service with axios
└── types/
    └── index.ts               # TypeScript interfaces
```

---

## 🛤️ Frontend Routes

| Route | Component | Access | Description |
|-------|-----------|--------|-------------|
| `/` | Index.tsx | Public | Redirects based on auth status |
| `/landing` | Landing.tsx | Public | Marketing landing page |
| `/login` | Login.tsx | Public | User login |
| `/register` | Register.tsx | Public | New user registration |
| `/dashboard` | voter/Dashboard.tsx | Voter | Voter dashboard |
| `/elections` | voter/Elections.tsx | Voter | List of available elections |
| `/vote/:id` | voter/VotingPage.tsx | Voter | Cast vote for election |
| `/results` | voter/Results.tsx | Voter | List of election results |
| `/results/:id` | voter/ResultsPage.tsx | Voter | Specific election results |
| `/profile` | voter/Profile.tsx | Voter | User profile page |
| `/admin` | admin/Dashboard.tsx | Admin | Admin dashboard |
| `/admin/elections` | admin/Elections.tsx | Admin | Manage all elections |
| `/admin/elections/new` | admin/CreateElection.tsx | Admin | Create new election |
| `/admin/elections/:id` | admin/ManageElection.tsx | Admin | Edit specific election |

---

## 🔌 Backend API Endpoints

### Update `src/services/api.ts` BASE_URL:
```typescript
const BASE_URL = 'http://your-backend-url/api';
```

### Authentication Endpoints

| Method | Endpoint | Body | Response | Description |
|--------|----------|------|----------|-------------|
| POST | `/auth/login` | `{ email, password }` | `{ token, user }` | User login |
| POST | `/auth/register` | `{ email, password, name, srn }` | `{ token, user }` | New user registration |
| GET | `/auth/me` | - | `{ user }` | Get current user (requires token) |
| POST | `/auth/logout` | - | `{ message }` | Logout user |

### Elections Endpoints

| Method | Endpoint | Body | Response | Description |
|--------|----------|------|----------|-------------|
| GET | `/elections` | - | `{ elections: [] }` | Get all elections |
| GET | `/elections/:id` | - | `{ election }` | Get single election |
| POST | `/elections` | `{ title, description, startDate, endDate, eligibleVoters }` | `{ election }` | Create election (Admin) |
| PUT | `/elections/:id` | `{ title?, description?, status? }` | `{ election }` | Update election (Admin) |
| DELETE | `/elections/:id` | - | `{ message }` | Delete election (Admin) |
| GET | `/elections/voter/eligible` | - | `{ elections: [] }` | Get elections for current voter |

### Candidates Endpoints

| Method | Endpoint | Body | Response | Description |
|--------|----------|------|----------|-------------|
| GET | `/elections/:electionId/candidates` | - | `{ candidates: [] }` | Get candidates for election |
| POST | `/elections/:electionId/candidates` | `{ name, party, photo? }` | `{ candidate }` | Add candidate (Admin) |
| PUT | `/candidates/:id` | `{ name?, party?, photo? }` | `{ candidate }` | Update candidate (Admin) |
| DELETE | `/candidates/:id` | - | `{ message }` | Delete candidate (Admin) |

### Voting Endpoints

| Method | Endpoint | Body | Response | Description |
|--------|----------|------|----------|-------------|
| POST | `/votes` | `{ electionId, candidateId }` | `{ vote, message }` | Cast a vote |
| GET | `/votes/check/:electionId` | - | `{ hasVoted: boolean }` | Check if user voted |

### Results Endpoints

| Method | Endpoint | Body | Response | Description |
|--------|----------|------|----------|-------------|
| GET | `/results/:electionId` | - | `{ results, winner }` | Get election results |
| GET | `/results` | - | `{ results: [] }` | Get all completed election results |

### Admin Endpoints

| Method | Endpoint | Body | Response | Description |
|--------|----------|------|----------|-------------|
| GET | `/admin/stats` | - | `{ totalElections, activeElections, totalVoters, totalVotes }` | Dashboard stats |
| POST | `/admin/elections/:id/voters/upload` | `FormData(file)` | `{ message, count }` | Upload voter CSV |
| GET | `/admin/users` | - | `{ users: [] }` | Get all users |

---

## 📝 Expected Response Formats

### User Object
```typescript
{
  id: string;
  email: string;
  name: string;
  srn: string;
  role: 'voter' | 'admin' | 'superadmin';
  createdAt: string;
}
```

### Election Object
```typescript
{
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  status: 'upcoming' | 'active' | 'completed';
  totalVoters: number;
  votedCount: number;
  createdBy: string;
}
```

### Candidate Object
```typescript
{
  id: string;
  electionId: string;
  name: string;
  party: string;
  photo?: string;
  voteCount: number;
}
```

### Vote Object
```typescript
{
  id: string;
  odId: string;
  odElectionId: string;
  odCandidateId: string;
  timestamp: string;
}
```

### Election Result Object
```typescript
{
  electionId: string;
  electionTitle: string;
  totalVotes: number;
  candidates: {
    id: string;
    name: string;
    party: string;
    voteCount: number;
    percentage: number;
  }[];
  winner: {
    id: string;
    name: string;
    party: string;
    voteCount: number;
  };
}
```

---

## 🔄 Connecting to Your Backend

### Step 1: Update Base URL
In `src/services/api.ts`, change:
```typescript
const BASE_URL = 'http://localhost:5000/api';
```

### Step 2: Update AuthContext
Replace mock authentication in `src/contexts/AuthContext.tsx`:

```typescript
import { authAPI } from '@/services/api';

const login = useCallback(async (email: string, password: string) => {
  setIsLoading(true);
  try {
    const { token, user } = await authAPI.login(email, password);
    localStorage.setItem('truechoice_token', token);
    localStorage.setItem('truechoice_user', JSON.stringify(user));
    setUser(user);
  } catch (error) {
    throw new Error('Invalid credentials');
  } finally {
    setIsLoading(false);
  }
}, []);
```

### Step 3: Replace Mock Data with API Calls
In components, replace mock data imports:

```typescript
// Before (using mock data)
import { mockElections } from '@/data/mockData';

// After (using API)
import { electionsAPI } from '@/services/api';
import { useQuery } from '@tanstack/react-query';

const { data: elections, isLoading } = useQuery({
  queryKey: ['elections'],
  queryFn: electionsAPI.getAll,
});
```

---

## 🎨 Demo Credentials (Mock Data)

| Role | Email | Password |
|------|-------|----------|
| Voter | voter@college.edu | voter123 |
| Admin | admin@college.edu | admin123 |
| Super Admin | super@college.edu | super123 |

---

## 📦 Key Dependencies

- **React** - UI framework
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **TanStack Query** - Data fetching & caching
- **Tailwind CSS** - Styling
- **Framer Motion** - Animations
- **Shadcn/UI** - Component library
- **Zod** - Schema validation
- **React Hook Form** - Form handling

---

## ✅ Checklist for Backend Integration

- [ ] Update `BASE_URL` in `src/services/api.ts`
- [ ] Implement all auth endpoints on backend
- [ ] Implement all elections endpoints
- [ ] Implement all candidates endpoints
- [ ] Implement voting endpoints with duplicate vote prevention
- [ ] Implement results calculation
- [ ] Add JWT token verification middleware
- [ ] Add role-based access control middleware
- [ ] Set up CORS for frontend origin
- [ ] Test all API endpoints with Postman/Insomnia
