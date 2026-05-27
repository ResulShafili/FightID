# FightID

FightID is a full-stack MMA fighter platform for verified fighter profiles, fight records, rankings, challenges, federation review, notifications, and public discovery.

## Project Structure

```text
.
├── src/                         # React + Tailwind frontend
├── public/                      # Frontend assets
├── fightid-backend/
│   ├── prisma/schema.prisma     # PostgreSQL schema
│   ├── prisma/seed.js           # Sample data
│   └── src/                     # Express API, services, routes, Socket.io
└── .env.example                 # Frontend env vars
```

## Frontend Setup

```bash
npm install
cp .env.example .env
npm run dev
```

Frontend env:

```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

## Backend Setup

```bash
cd fightid-backend
npm install
cp .env.example .env
npx prisma generate
npx prisma migrate dev
npm run seed
npm run dev
```

Backend runs on `http://localhost:5000` by default. Health check: `GET /health`.

Required backend env:

```env
DATABASE_URL=
JWT_SECRET=
JWT_REFRESH_SECRET=
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
RESEND_API_KEY=
CLIENT_URL=http://localhost:3000
PORT=5000
```

For local email, configure `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, and `SMTP_PASS`. If SMTP is not configured, email delivery is skipped while in-app and Socket.io notifications still work.

## Railway Deployment

1. Create a Railway project with PostgreSQL.
2. Set the backend root directory to `fightid-backend`.
3. Add the environment variables from `fightid-backend/.env.example`.
4. Use `npm run prisma:deploy` during deploy or Railway's migrate step.
5. Start command: `npm start`.

## Auth

All protected routes require:

```http
Authorization: Bearer <accessToken>
```

Access tokens expire quickly. Refresh tokens are stored server-side as hashes and rotated on `/api/auth/refresh`.

## API Endpoints

### Auth `/api/auth`

| Method | Path | Description |
| --- | --- | --- |
| POST | `/register` | Create a user and fighter profile. Returns user, access token, refresh token. |
| POST | `/login` | Login with email and password. |
| POST | `/refresh` | Rotate refresh token and return new tokens. |
| POST | `/logout` | Revoke a refresh token. |

### Fighters `/api/fighters`

| Method | Path | Description |
| --- | --- | --- |
| GET | `/` | List fighters. Query: `weightClass`, `country`, `role`, `search`, `page`, `limit`. |
| GET | `/leaderboard` | Ranked fighters. Query: `weightClass`, `country`, `role=PRO\|AMATEUR`, `page`, `limit`. |
| GET | `/:id` | Public profile with fight history and stats. |
| PUT | `/me` | Update own profile. Auth required. |
| POST | `/me/photo` | Upload `photo` multipart file to Cloudinary. Auth required. |

### Fights `/api/fights`

| Method | Path | Description |
| --- | --- | --- |
| POST | `/` | Submit own fight record. Auth required. |
| GET | `/fighter/:fighterId` | Get fights for a fighter. |
| PUT | `/:id/verify` | Admin/federation rep verifies a fight and triggers ranking update. |
| DELETE | `/:id` | Fighter deletes own unverified fight, or admin/federation rep deletes. |

### Challenges `/api/challenges`

| Method | Path | Description |
| --- | --- | --- |
| POST | `/` | Send a challenge. Auth required. |
| GET | `/mine` | Sent and received challenges for logged-in fighter. |
| PUT | `/:id/accept` | Receiver accepts. |
| PUT | `/:id/decline` | Receiver declines. |
| PUT | `/:id/counter` | Receiver sends counter-offer. |
| PUT | `/:id/cancel` | Sender cancels pending/countered challenge. |
| POST | `/:id/result` | Fighter submits challenge result. |
| PUT | `/:id/confirm-result` | Opponent confirms or admin overrides. |

### Verification `/api/verification`

| Method | Path | Description |
| --- | --- | --- |
| POST | `/apply` | Submit Pro request with multipart `document`. |
| GET | `/pending` | Federation rep/admin pending requests. |
| PUT | `/:id/approve` | Approve request, set profile verified, set user role `PRO`. |
| PUT | `/:id/reject` | Reject request with note. |

### Notifications `/api/notifications`

| Method | Path | Description |
| --- | --- | --- |
| GET | `/` | Current user's notifications. |
| PUT | `/:id/read` | Mark one notification as read. |
| PUT | `/read-all` | Mark all notifications as read. |

### Admin `/api/admin`

| Method | Path | Description |
| --- | --- | --- |
| GET | `/stats` | Total fighters, fights, active challenges, Pro count. |
| GET | `/fighters` | All fighters with filters. |
| PUT | `/fighters/:id/role` | Manually change user role. |
| DELETE | `/fights/:id` | Remove any fight record. |

## Ranking Logic

Rankings update when a fight is verified and once daily via cron:

- Win: `100` base points.
- Opponent top 10 in weight class/status: `x2.5`.
- Opponent rank 11-50: `x1.5`.
- Unranked opponent: `x1.0`.
- Loss: `-30`, floored at zero.
- Draw/no contest: no change.
- Inactivity decay: `-10` per 90 days without a verified fight.
- Pro and Amateur leaderboards are separate through `isVerifiedPro`.

## Socket.io Events

Client connects to the backend socket URL and emits:

```js
socket.emit("fighter:join", userId);
```

Server emits:

- `challenge:received`
- `challenge:accepted`
- `challenge:declined`
- `result:confirmed`
- `pro:approved`
- `notification:new`

## Seed Accounts

All seed users use password:

```text
Password123!
```

Useful accounts:

- `admin@fightid.app`
- `rep.az@fightid.app`
- `darya@fightid.app`
- `elias@fightid.app`
