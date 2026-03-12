# TrueChoice Frontend — Instructions & API Reference

> Last updated: March 2026. All endpoints verified against the TrueChoice backend source.

---

## 📁 Project Structure

```
src/
├── components/
│   ├── ui/                    # Shadcn UI components
│   ├── layout/
│   │   └── DashboardLayout.tsx   # Main layout with sidebar
│   └── common/
│       ├── NavLink.tsx           # Navigation link component
│       ├── ProtectedRoute.tsx    # Auth route protection
│       ├── StatusBadge.tsx       # Election status badge
│       └── Skeletons.tsx         # Loading skeleton components
├── contexts/
│   └── AuthContext.tsx        # Authentication context & state
├── hooks/
│   └── useQueries.ts          # All React Query hooks
├── pages/
│   ├── admin/
│   │   ├── Dashboard.tsx         # Admin dashboard
│   │   ├── Elections.tsx         # Election management list
│   │   ├── CreateElection.tsx    # Create new election (always draft)
│   │   └── ManageElection.tsx    # Single election management
│   ├── voter/
│   │   ├── Dashboard.tsx         # Voter dashboard
│   │   ├── Elections.tsx         # Active/scheduled elections (eligible only)
│   │   ├── VotingPage.tsx        # Cast vote
│   │   ├── Results.tsx           # Published results list
│   │   ├── ResultsPage.tsx       # Single election results
│   │   └── Profile.tsx           # Voter profile & password reset
│   ├── superadmin/
│   │   └── Dashboard.tsx         # Superadmin user management
│   ├── Landing.tsx            # Marketing landing page
│   ├── Login.tsx              # Login page
│   ├── Register.tsx           # Registration page
│   └── NotFound.tsx           # 404 page
├── services/
│   └── api.ts                 # Axios instance + all API functions
├── types/
│   └── index.ts               # TypeScript interfaces
├── hooks/
│   └── useQueries.ts          # React Query data-fetching hooks
└── constants/
    └── queryKeys.ts           # Centralised React Query cache keys
```

---

## 🔐 Environment Variables

Copy `.env.example` to `.env` and fill in:

```dotenv
# Backend API base URL (no trailing slash)
# Local: http://localhost:3000
# Production: https://your-backend-url.onrender.com
VITE_API_URL=http://localhost:3000
```

The `VITE_API_URL` is the **only** frontend env variable. It maps to `import.meta.env.VITE_API_URL` in `src/services/api.ts`.

---

## 🛤️ Frontend Routes

| Route                          | Component                | Guard            | Notes                                                  |
| ------------------------------ | ------------------------ | ---------------- | ------------------------------------------------------ |
| `/`                            | Smart redirect           | Public           | Redirects to dashboard based on role                   |
| `/login`                       | Login.tsx                | Public           |                                                        |
| `/register`                    | Register.tsx             | Public           |                                                        |
| `/dashboard`                   | voter/Dashboard.tsx      | voter            |                                                        |
| `/elections`                   | voter/Elections.tsx      | voter            | Shows active+scheduled elections voter is eligible for |
| `/vote/:electionId`            | voter/VotingPage.tsx     | voter            |                                                        |
| `/results`                     | voter/Results.tsx        | voter            | Closed elections with published results                |
| `/results/:electionId`         | voter/ResultsPage.tsx    | any auth         |                                                        |
| `/profile`                     | voter/Profile.tsx        | voter            |                                                        |
| `/admin`                       | admin/Dashboard.tsx      | admin/superadmin |                                                        |
| `/admin/elections`             | admin/Elections.tsx      | admin/superadmin |                                                        |
| `/admin/elections/new`         | admin/CreateElection.tsx | admin/superadmin |                                                        |
| `/admin/elections/:electionId` | admin/ManageElection.tsx | admin/superadmin |                                                        |
| `/superadmin`                  | superadmin/Dashboard.tsx | superadmin       |                                                        |

---

## 🔌 Backend API — All Endpoints

> **Base URL:** `VITE_API_URL` (e.g. `http://localhost:3000`)  
> **No `/api` prefix** anywhere — routes are `/user`, `/admin`, `/superadmin`.  
> **All responses** follow the shape `{ success: boolean, message: string, data: {...} }`.  
> **Auth header:** `Authorization: Bearer <token>` (added automatically by the Axios interceptor).

### Standard response wrapper

```json
{
  "success": true,
  "message": "...",
  "data": { ... }
}
```

---

### 👤 Voter Routes (`/user`)

| Method | Path                          | Auth   | Body                                 | Notes                                                                                |
| ------ | ----------------------------- | ------ | ------------------------------------ | ------------------------------------------------------------------------------------ |
| POST   | `/user/register`              | Public | `{ fullName, email, srn, password }` | Rate-limited                                                                         |
| POST   | `/user/login`                 | Public | `{ email, password }`                | Returns `{ data: { token, user } }`                                                  |
| GET    | `/user/profile`               | JWT    | —                                    | Returns `{ data: { user: { name, email, SRN } } }`                                   |
| PUT    | `/user/profile/resetpassword` | JWT    | `{ currentPassword, newPassword }`   |                                                                                      |
| GET    | `/user/elections/active`      | JWT    | —                                    | Elections voter is eligible for; returns `{ data: { scheduled: [], ongoing: [] } }`  |
| GET    | `/user/elections/all`         | JWT    | —                                    | Only `closed + publishResults: true` elections                                       |
| GET    | `/user/elections/:id/ballot`  | JWT    | —                                    | Returns `{ data: { election, candidates: [{ _id, displayName }] } }` — no `hasVoted` |
| POST   | `/user/elections/:id/vote`    | JWT    | `{ candidateId }`                    |                                                                                      |
| GET    | `/user/elections/:id/results` | JWT    | —                                    | Only if `closed + publishResults: true`                                              |

**Login response shape:**

```json
{ "data": { "token": "...", "user": { "id", "fullName", "email", "role" } } }
```

**Active elections response shape:**

```json
{ "data": { "scheduled": [ ...elections ], "ongoing": [ ...elections ] } }
```

---

### 🛡️ Admin Routes (`/admin`)

| Method | Path                                     | Auth      | Body                                                            | Notes                                                             |
| ------ | ---------------------------------------- | --------- | --------------------------------------------------------------- | ----------------------------------------------------------------- |
| POST   | `/admin/elections/create`                | JWT+admin | `{ title, positionName, description?, startTime, endTime }`     | Creates as `draft`                                                |
| GET    | `/admin/elections`                       | JWT+admin | —                                                               | All elections with `candidateCount` + `eligibleCount`             |
| GET    | `/admin/elections/:id`                   | JWT+admin | —                                                               | Full details; field is **`publishResults`** (not `publicResults`) |
| PUT    | `/admin/elections/:id`                   | JWT+admin | `{ title?, positionName?, description?, startTime?, endTime? }` | Only when `draft`                                                 |
| PATCH  | `/admin/elections/:id/schedule`          | JWT+admin | (body ignored)                                                  | Moves `draft` → `scheduled` using stored times                    |
| POST   | `/admin/elections/:id/start`             | JWT+admin | `{ forceStart: true }`                                          | Forces `scheduled` → `ongoing`                                    |
| POST   | `/admin/elections/:id/close`             | JWT+admin | `{ forceClose: true }`                                          | Forces `ongoing` → `closed`                                       |
| POST   | `/admin/elections/:id/candidates/create` | JWT+admin | `{ displayName, manifesto?, photoUrl? }`                        |                                                                   |
| GET    | `/admin/elections/:id/candidates`        | JWT+admin | —                                                               | Returns `{ data: { candidate: [...] } }` — singular key!          |
| DELETE | `/admin/candidates/:candidateId`         | JWT+admin | —                                                               | Only when `draft`                                                 |
| GET    | `/admin/elections/:id/results`           | JWT+admin | —                                                               | Returns vote counts regardless of status                          |
| PATCH  | `/admin/elections/:id/publish-results`   | JWT+admin | —                                                               | Sets `publishResults = true`                                      |
| POST   | `/admin/elections/:id/eligible/upload`   | JWT+admin | `FormData { file: CSV }`                                        | Returns `{ data: { summary: { uniqueSrns } } }`                   |

> ⚠️ **No `DELETE /admin/elections/:id` route exists.** The UI shows a toast when attempted.

**Election detail response (`GET /admin/elections/:id`):**

```json
{
  "data": {
    "election": { "id", "title", "positionName", "status", "startTime", "endTime", "publishResults" },
    "stats": { "totalCandidates", "totalVotes", "eligibleCount" },
    "candidates": [{ "id", "name", "manifesto", "photoUrl", "createdAt" }]
  }
}
```

**Candidates list response (`GET /admin/elections/:id/candidates`):**

```json
{
  "data": {
    "election": { "id", "title", "positionName", "status" },
    "totalCandidates": 2,
    "candidate": [{ "id", "electionId", "name", "manifesto", "photoUrl", "createdAt" }]
  }
}
```

> Note: key is `candidate` (singular), and the display name field is `name` (not `displayName`).  
> The `useAdminCandidates` hook normalises both to `displayName` automatically.

**Results response (`GET /admin/elections/:id/results`):**

```json
{
  "data": {
    "totalVotes": 5,
    "results": [{ "candidateId", "displayName", "votes", "percentage" }]
  }
}
```

---

### 👑 Superadmin Routes (`/superadmin`)

| Method | Path                                        | Auth           | Notes              |
| ------ | ------------------------------------------- | -------------- | ------------------ |
| GET    | `/superadmin/users`                         | JWT+superadmin | All users          |
| GET    | `/superadmin/admin`                         | JWT+superadmin | All admin users    |
| POST   | `/superadmin/users/:userId/make-admin`      | JWT+superadmin | Promote to admin   |
| POST   | `/superadmin/users/:userId/make-superadmin` | JWT+superadmin | Transfer ownership |

---

## 🧪 TypeScript Types

Key interfaces in `src/types/index.ts`:

```typescript
type ElectionStatus = "draft" | "scheduled" | "ongoing" | "closed";

interface Election {
  id: string;
  title: string;
  positionName: string;
  description?: string;
  startTime?: string; // May be absent in some voter-facing responses
  endTime?: string; // May be absent in some voter-facing responses
  status: ElectionStatus;
  publishResults?: boolean; // Admin field from GET /admin/elections/:id
  publicResults?: boolean; // Legacy alias; prefer publishResults
  startedAt?: string;
  closedAt?: string;
  createdAt: string;
  candidateCount?: number; // Admin list endpoint only
  eligibleCount?: number;
}

// Voter-facing ballot candidate (GET /user/elections/:id/ballot)
interface Candidate {
  id: string;
  displayName: string; // Voter ballot uses displayName
  manifesto?: string;
  photoUrl?: string;
}

// Admin candidate (after normalisation in useAdminCandidates)
interface AdminCandidate {
  id: string;
  name: string; // Raw from backend
  displayName: string; // Normalised from name in useAdminCandidates hook
  manifesto?: string;
  photoUrl?: string;
}
```

---

## 🔄 React Query Hooks (`src/hooks/useQueries.ts`)

| Hook                     | Endpoint used                         | Returns                                  |
| ------------------------ | ------------------------------------- | ---------------------------------------- |
| `useVoterElections()`    | `GET /user/elections/active`          | Merged `[...ongoing, ...scheduled]`      |
| `useVoterBallot(id)`     | `GET /user/elections/:id/ballot`      | `{ election, candidates }`               |
| `useVoterResults(id)`    | `GET /user/elections/:id/results`     | `{ totalVotes, results, winners }`       |
| `useAdminElections()`    | `GET /admin/elections`                | Normalised elections array               |
| `useAdminElection(id)`   | `GET /admin/elections/:id`            | `{ election, stats, candidates }`        |
| `useAdminCandidates(id)` | `GET /admin/elections/:id/candidates` | Candidates with `displayName` normalised |
| `useAdminResults(id)`    | `GET /admin/elections/:id/results`    | `{ totalVotes, results }`                |
| `useSuperadminUsers()`   | `GET /superadmin/users`               | Users array                              |
| `useCastVote(id)`        | `POST /user/elections/:id/vote`       | Mutation                                 |

---

## 🛠️ Known Limitations

| Limitation                                  | Detail                                                                                                        |
| ------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| No delete election                          | `DELETE /admin/elections/:id` does not exist in the backend. The UI shows an informational toast.             |
| No `hasVoted` in ballot                     | The voter ballot endpoint does not return a `hasVoted` field. Vote state is tracked locally after submission. |
| No startTime/endTime in voter all-elections | `GET /user/elections/all` strips those fields; use `getActive` for time-aware displays.                       |
| Schedule ignores body                       | `PATCH /admin/elections/:id/schedule` ignores any body; save settings with `PUT` before scheduling.           |

---

## 📦 Key Dependencies

- **React 18** + **TypeScript**
- **React Router v6** — client-side routing
- **Axios** — HTTP client with interceptors
- **TanStack Query v5** — data fetching & caching
- **Tailwind CSS** + **Shadcn/UI** — styling & component library
- **Framer Motion** — animations
- **Bun** — package manager & runtime
