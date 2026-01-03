/**
 * Prompt templates for AI agent
 */

import { Goal, Topic, StudySession, calculateMemoryDecayLevel } from "../types";

export interface PromptContext {
  today: string;
  activeGoals: Goal[];
  topicsNeedingReview: Topic[];
  recentSessions: StudySession[];
  allTopics: Topic[];
}

/**
 * Builds the system prompt for the study planner AI
 */
export function buildSystemPrompt(): string {
  return `You are an expert study planner AI for college students. Your role is to generate realistic, achievable daily study plans that optimize learning through spaced repetition and prioritize urgent material.

Key principles:
1. Prioritize topics with red/orange memory decay (haven't been reviewed recently)
2. Balance urgent deadlines with long-term retention
3. Mix review sessions with new learning
4. Create realistic time estimates (30-120 minutes per task)
5. Use spaced repetition intervals
6. Consider student energy levels (harder topics earlier)

Always respond with ONLY valid JSON, no markdown, no code blocks, no explanations outside the JSON.`;
}

/**
 * Builds the user prompt with context about goals, topics, and study history
 */
export function buildUserPrompt(context: PromptContext): string {
  const { today, activeGoals, topicsNeedingReview, recentSessions, allTopics } = context;

  // Build goals section
  const goalsSection = activeGoals.length > 0
    ? activeGoals
        .map((goal) => {
          const daysUntil = Math.ceil(
            (new Date(goal.deadline).getTime() - new Date().getTime()) /
              (1000 * 60 * 60 * 24)
          );
          const urgency =
            daysUntil < 0
              ? "🔴 OVERDUE"
              : daysUntil <= 7
              ? "🟠 URGENT"
              : daysUntil <= 14
              ? "🟡 SOON"
              : "🟢 UPCOMING";

          return `Goal: "${goal.title}" (${goal.type})
  - Priority: ${"★".repeat(goal.priority)}${"☆".repeat(5 - goal.priority)}
  - Deadline: ${goal.deadline.split("T")[0]} (${daysUntil < 0 ? Math.abs(daysUntil) + " days overdue" : daysUntil + " days left"}) ${urgency}
  - Topics: ${goal.topics.map((t) => t.name).join(", ")}`;
        })
        .join("\n\n")
    : "No active goals";

  // Build topics with decay status
  const topicsWithDecay = allTopics.map((topic) => {
    const decayLevel = calculateMemoryDecayLevel(
      topic.lastReviewed,
      topic.reviewCount
    );
    const decayEmoji =
      decayLevel === "red"
        ? "🔴"
        : decayLevel === "orange"
        ? "🟠"
        : decayLevel === "yellow"
        ? "🟡"
        : "🟢";

    const lastReviewText = topic.lastReviewed
      ? `Last reviewed: ${new Date(topic.lastReviewed).toLocaleDateString()} (${Math.floor((new Date().getTime() - new Date(topic.lastReviewed).getTime()) / (1000 * 60 * 60 * 24))} days ago)`
      : "Never reviewed";

    return `${decayEmoji} ${topic.name} (ID: ${topic.id}, Goal: ${topic.goalId})
  - Mastery: ${topic.masteryLevel}% | Reviews: ${topic.reviewCount}
  - ${lastReviewText}
  - Decay Level: ${decayLevel.toUpperCase()}`;
  });

  // Build topics needing review section
  const reviewSection =
    topicsNeedingReview.length > 0
      ? topicsNeedingReview
          .map((topic) => {
            const decayLevel = calculateMemoryDecayLevel(
              topic.lastReviewed,
              topic.reviewCount
            );
            return `- ${topic.name} (ID: ${topic.id}, Goal: ${topic.goalId}) - ${decayLevel.toUpperCase()} decay`;
          })
          .join("\n")
      : "No topics currently need review";

  // Build recent study history
  const recentHistory = recentSessions.length > 0
    ? recentSessions
        .slice(0, 10)
        .map(
          (session) =>
            `- ${new Date(session.date).toLocaleDateString()}: ${session.durationMinutes} min on topic ${session.topicId}`
        )
        .join("\n")
    : "No recent study sessions";

  return `Generate a realistic daily study plan for ${today}.

**ACTIVE GOALS:**
${goalsSection}

**ALL TOPICS WITH DECAY STATUS:**
${topicsWithDecay.join("\n\n")}

**TOPICS NEEDING REVIEW (Priority):**
${reviewSection}

**RECENT STUDY HISTORY (Last 7 days):**
${recentHistory}

**INSTRUCTIONS:**
1. Create a realistic 4-6 hour daily study plan (240-360 minutes total)
2. Prioritize in this order:
   a) Topics with RED/ORANGE decay (urgent review needed)
   b) Goals with urgent deadlines (within 7 days)
   c) High-priority goals (priority 4-5)
   d) Topics with YELLOW decay (maintenance review)
3. Mix review sessions (30-60 min) with new learning (45-90 min)
4. Include 1-2 breaks between sessions
5. Balance difficulty (harder topics earlier when energy is higher)

**REQUIRED JSON FORMAT:**
Return ONLY valid JSON in this exact structure:
{
  "reasoning": "Brief explanation of why this plan prioritizes certain topics and balances review vs new learning",
  "tasks": [
    {
      "topicId": "topic-123",
      "goalId": "goal-456",
      "type": "review",
      "estimatedMinutes": 45,
      "priority": 5,
      "reasoning": "This topic has red decay and hasn't been reviewed in 15 days"
    }
  ]
}

**IMPORTANT:**
- Return ONLY the JSON object, no markdown, no code blocks, no extra text
- Each task must reference a valid topicId and goalId from the information above
- Total estimated minutes should be between 240-360
- Include 4-6 tasks total
- Use "review" for topics needing review, "study" for new learning, "project_work" for project-related tasks`;
}

