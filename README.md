# Cloudflare AI Chat - Full Stack Application

Complete frontend and backend for a Cloudflare AI Chat application with memory and an Agentic Study & Life Planner.

## Project Structure

```
.
├── frontend/          # React + Vite + TypeScript frontend
└── cf_ai_memchat/     # Cloudflare Worker backend
    └── worker/        # Worker source code
        ├── src/
        │   ├── types.ts                    # Phase 1: Data models
        │   ├── durable-objects/            # Phase 2: Durable Objects
        │   │   ├── UserStateDO.ts         # User state management
        │   │   └── index.ts
        │   ├── index.ts                    # Phase 3: Hono API routes
        │   └── memory.ts                   # Chat memory (original)
```

## Features

### Frontend
- 💬 Modern React chat interface
- 🎨 TailwindCSS styling with dark mode
- 🔄 Dynamic user IDs stored in localStorage
- 📱 Responsive design
- ⚡ Vite for fast development

### Backend
- 🤖 Cloudflare Workers AI integration
- 💾 Durable Objects for per-user memory
- 🔄 Conversation memory (last 10 turns)
- ✅ CORS headers configured
- 🚀 Serverless deployment

### Study Planner (New - Phases 1-3)
- 📚 Goal management (exams, projects, commitments)
- 📖 Topic tracking with spaced repetition
- 📝 Study session logging
- 🤖 AI-powered daily plan generation
- 🎯 Memory decay tracking (green/yellow/orange/red)
- ⚡ Urgency scoring based on deadlines and priority

## Implementation Phases

### Phase 1: Data Models & Core Architecture ✅
**Location:** `cf_ai_memchat/worker/src/types.ts`

Created comprehensive TypeScript data models:
- **Goal Model**: Study goals with deadlines, priorities, and topics
- **Topic Model**: Individual topics with review tracking and mastery levels
- **StudySession Model**: Logged study sessions
- **DailyPlan Model**: AI-generated daily study plans
- **UserState Model**: Complete user state stored in Durable Objects

Helper functions:
- `calculateMemoryDecayLevel()` - Determines review urgency (green/yellow/orange/red)
- `getSpacedRepetitionInterval()` - Calculates review intervals (1, 3, 7, 14, 30 days)
- `getUrgencyScore()` - Scores goal urgency (0-100) based on deadline and priority
- Additional utilities for topic review scheduling and goal management

### Phase 2: Durable Object Implementation ✅
**Location:** `cf_ai_memchat/worker/src/durable-objects/UserStateDO.ts`

Created `UserStateDO` Durable Object class with:

**Storage Methods:**
- `getState()` - Retrieves user state, creates default if none exists
- `setState()` - Persists state with `waitUntil()` for reliability

**Goal Management:**
- `addGoal()` - Create new goal with auto-generated ID
- `updateGoal()` - Update existing goal
- `deleteGoal()` - Remove goal and associated data

**Topic & Session Management:**
- `addTopic()` - Add topic to a goal
- `recordSession()` - Log study session and update topic stats
- `getTopicsNeedingReview()` - Get topics sorted by urgency

**Daily Plan Management:**
- `generateDailyPlan()` - Store AI-generated plan
- `getDailyPlan()` - Retrieve plan for specific date
- `getGoalsWithDecay()` - Get goals with memory decay indicators

All methods include proper error handling, validation, and HTTP response codes.

### Phase 3: Worker API Routes ✅
**Location:** `cf_ai_memchat/worker/src/index.ts`

Implemented Hono-based RESTful API with 8 endpoints:

1. **POST /api/goals** - Create new goal
   - Body: `{ title, type, deadline, priority, topics: string[] }`
   - Returns: Goal object

2. **GET /api/goals** - List all active goals with memory decay indicators
   - Returns: Goal[] with decay information

3. **PUT /api/goals/:id** - Update goal
   - Body: Partial<Goal>
   - Returns: Updated Goal

4. **DELETE /api/goals/:id** - Archive goal
   - Returns: Success confirmation

5. **POST /api/sessions** - Record study session
   - Body: `{ topicId, goalId, durationMinutes, notes }`
   - Automatically updates topic review stats

6. **GET /api/plan/:date** - Get daily plan for date (YYYY-MM-DD)
   - Returns: DailyPlan or 404

7. **POST /api/plan/generate** - Generate today's plan using AI
   - Body: `{ date?: string }` (optional, defaults to today)
   - Uses Cloudflare Workers AI to generate personalized study plan
   - Returns: Generated DailyPlan

8. **GET /api/review** - Get topics needing review (sorted by urgency)
   - Query param: `asOfDate` (optional)
   - Returns: Topic[] sorted by urgency

**Architecture:**
- User identification via `X-User-Id` header or `userId` query param
- All routes use Durable Object for state management
- Comprehensive error handling and validation
- CORS enabled for all routes

## Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The frontend will be available at `http://localhost:5173`

## Backend Setup

```bash
cd cf_ai_memchat/worker
npm install
npm run dev    # Local development with wrangler
npm run deploy # Deploy to Cloudflare Workers
```

## API Usage Examples

### Create a Goal
```bash
POST /api/goals
Headers: X-User-Id: user123
Body: {
  "title": "Math Final Exam",
  "type": "exam",
  "deadline": "2024-12-15T00:00:00Z",
  "priority": 5,
  "topics": ["Algebra", "Calculus", "Statistics"]
}
```

### Record a Study Session
```bash
POST /api/sessions
Body: {
  "topicId": "topic_123",
  "goalId": "goal_456",
  "durationMinutes": 45,
  "notes": "Reviewed algebra basics"
}
```

### Generate Daily Plan
```bash
POST /api/plan/generate
Body: {
  "date": "2024-11-15"
}
```

### Get Topics Needing Review
```bash
GET /api/review?userId=user123
```

## Deploy

### Quick Deploy (Using Scripts)

**Deploy everything:**
```powershell
.\deploy-all.ps1
```

**Deploy individually:**
```powershell
.\deploy-backend.ps1   # Backend only
.\deploy-frontend.ps1  # Frontend only
```

### Manual Deploy

**Frontend (Cloudflare Pages):**
```powershell
cd frontend
npm run build
npx wrangler pages deploy dist --project-name=cloudflare-ai-chat
```

**Backend (Cloudflare Workers):**
```powershell
cd cf_ai_memchat\worker
npm run deploy
```

📖 **See [DEPLOY.md](DEPLOY.md) for detailed deployment guide**

## Environment Variables

The frontend uses the backend API endpoint. Update `frontend/src/components/Chat.tsx` if needed:
- Default: `https://cf-ai-memchat-worker.aravindpillarisetty.workers.dev/api/chat`
- Or set `VITE_API_URL` in `.env` file

## User IDs

Each user gets a unique ID stored in localStorage. This ID is used to maintain separate conversation memories and study planner state per user.

## Dependencies

### Backend
- `hono` - Fast web framework for Cloudflare Workers
- `@cloudflare/workers-types` - TypeScript types
- `wrangler` - Cloudflare Workers CLI

### Frontend
- `react` - UI framework
- `vite` - Build tool
- `tailwindcss` - Styling

## License

MIT
