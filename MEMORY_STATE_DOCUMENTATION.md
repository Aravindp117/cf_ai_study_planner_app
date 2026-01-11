# Memory & State Documentation

This document explains how the Study Planner application maintains memory and state.

## Overview

The application uses **two separate Durable Objects** to maintain different types of memory and state:

1. **Memory Durable Object** (`Memory`) - Maintains conversation history
2. **UserState Durable Object** (`UserStateDO`) - Maintains study planner state

Both are isolated Durable Objects that persist data independently.

---

## 1. Conversation Memory (Memory Durable Object)

**Location**: `cf_ai_memchat/worker/src/memory.ts`

**Purpose**: Stores conversation history for the chat interface

**Storage**:
- Stores the last **10 conversation turns** (5 user messages + 5 assistant responses)
- Uses `this.state.storage.put("turns", ...)` to persist
- Uses `this.state.storage.get("turns")` to retrieve

**Data Structure**:
```typescript
Array<{ role: "user" | "assistant"; content: string }>
```

**How it works**:
1. User sends a message via `/api/chat`
2. If not a command, the message is passed to the Memory DO
3. Memory DO loads previous turns from storage
4. Builds conversation context: `[system prompt, ...previous turns, new user message]`
5. Calls Workers AI with full conversation history
6. Stores the new exchange (user message + AI response) in storage
7. Caps at last 10 turns total (rolling window)

**System Prompt**:
- Updated to be study planner-aware: "You are a helpful study planner assistant. You help students manage their study goals, track progress, and plan their daily study sessions."
- Remembers conversation context across multiple messages
- Provides contextual responses based on previous conversation

**API Endpoint**: `POST /api/chat` (non-command messages)

---

## 2. Study Planner State (UserStateDO Durable Object)

**Location**: `cf_ai_memchat/worker/src/durable-objects/UserStateDO.ts`

**Purpose**: Stores all study planner data (goals, topics, sessions, plans)

**Storage**:
- Stores complete `UserState` object
- Uses `this.state.storage.put("userState", ...)` to persist
- Uses `this.state.storage.get("userState")` to retrieve

**Data Structure**:
```typescript
interface UserState {
  userId: string;
  goals: Goal[];              // All study goals
  sessions: StudySession[];   // All logged study sessions
  dailyPlans: DailyPlan[];    // All generated daily plans
  lastPlanGenerated: string | null;
}
```

**What it stores**:
- ✅ **Goals**: All study goals (active, completed, archived)
- ✅ **Topics**: All topics under each goal
- ✅ **Sessions**: All logged study sessions with dates, duration, notes
- ✅ **Daily Plans**: All AI-generated daily study plans
- ✅ **Topic Metadata**: lastReviewed dates, reviewCount, masteryLevel for each topic

**How it works**:
1. Each API endpoint gets the UserStateDO stub: `env.USER_STATE.get(env.USER_STATE.idFromName(userId))`
2. UserStateDO methods read/write to `this.state.storage`
3. All mutations are persisted immediately
4. State is retrieved via `getState()` method
5. State is saved via `setState()` method

**CRUD Operations**:
- `addGoal()` - Creates new goal, persists to storage
- `updateGoal()` - Updates existing goal, persists changes
- `deleteGoal()` - Removes goal, persists updated state
- `recordSession()` - Logs session, updates topic stats, persists
- `generateDailyPlan()` - Stores new plan, persists
- `deleteDailyPlan()` - Removes plan, persists

**API Endpoints**: All `/api/goals`, `/api/sessions`, `/api/plan/*` endpoints use UserStateDO

---

## Memory vs State: Key Differences

| Aspect | Memory DO | UserStateDO |
|--------|-----------|-------------|
| **Purpose** | Conversation history | Study planner data |
| **Storage** | Last 10 turns | Complete user state |
| **Data Type** | Array of messages | UserState object |
| **Retention** | Rolling window (10 turns) | Persistent (all data) |
| **Used By** | Chat interface | All study planner features |
| **Access** | `/api/chat` (non-commands) | All `/api/goals`, `/api/sessions`, `/api/plan/*` |

---

## How They Work Together

1. **Chat with Memory**:
   - User sends message → Memory DO retrieves previous conversation
   - AI responds with conversation context
   - New exchange stored in Memory DO

2. **Study Planner with State**:
   - User creates goal → UserStateDO stores in state
   - User logs session → UserStateDO updates topic stats
   - User generates plan → UserStateDO stores plan
   - All operations persist immediately

3. **Independence**:
   - Memory DO and UserStateDO are separate Durable Objects
   - They don't share data directly (by design)
   - Each maintains its own isolated state
   - Both persist across requests for the same userId

---

## Persistence & Durability

Both Durable Objects:
- ✅ **Persist data** across requests
- ✅ **Maintain state** for each userId
- ✅ **Survive deployments** (data is durable)
- ✅ **Isolated per user** (each userId has separate instances)
- ✅ **Atomic operations** (storage operations are consistent)

---

## Example Flow

### Chat Flow (Memory)
```
User: "How am I doing with my studies?"
  → Memory DO loads: [previous 9 turns]
  → AI responds with context
  → Memory DO stores: [previous 9 turns + new exchange]
  → Next message: Memory DO loads [previous 10 turns including the new one]
```

### Study Planner Flow (State)
```
User creates goal: "Learn Calculus"
  → UserStateDO.getState() → loads current state
  → UserStateDO.addGoal() → adds goal to state.goals[]
  → UserStateDO.setState() → persists to storage
  → Next request: UserStateDO.getState() → includes the new goal
```

---

## Summary

✅ **Conversation Memory**: Maintained by `Memory` Durable Object (last 10 turns)
✅ **Study Planner State**: Maintained by `UserStateDO` Durable Object (all goals, sessions, plans)
✅ **Both persist**: Data survives across requests and deployments
✅ **Both isolated**: Each userId has separate instances
✅ **Both working**: The application maintains both memory and state as required

