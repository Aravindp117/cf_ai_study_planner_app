/**
 * AI Agent for generating intelligent daily study plans
 */

import { UserState, DailyPlan, PlannedTask, Goal, Topic, StudySession } from "../types";
import { buildSystemPrompt, buildUserPrompt, PromptContext } from "./prompts";

interface Ai {
  run(
    model: string,
    options: {
      messages: Array<{ role: string; content: string }>;
      temperature?: number;
      max_tokens?: number;
    }
  ): Promise<any>;
}

/**
 * Extracts JSON from LLM response, handling markdown code blocks
 */
function extractJSON(text: string): any | null {
  // Try to find JSON in markdown code blocks
  const jsonBlockMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  if (jsonBlockMatch) {
    try {
      return JSON.parse(jsonBlockMatch[1]);
    } catch (e) {
      // Continue to try other methods
    }
  }

  // Try to find JSON object directly
  const jsonObjectMatch = text.match(/\{[\s\S]*\}/);
  if (jsonObjectMatch) {
    try {
      return JSON.parse(jsonObjectMatch[0]);
    } catch (e) {
      // Continue to try other methods
    }
  }

  // Try parsing the entire text
  try {
    return JSON.parse(text.trim());
  } catch (e) {
    return null;
  }
}

/**
 * Validates that a task has all required fields and references valid IDs
 */
function validateTask(
  task: any,
  validTopicIds: Set<string>,
  validGoalIds: Set<string>
): task is PlannedTask {
  return (
    typeof task === "object" &&
    typeof task.topicId === "string" &&
    typeof task.goalId === "string" &&
    typeof task.type === "string" &&
    ["study", "review", "project_work"].includes(task.type) &&
    typeof task.estimatedMinutes === "number" &&
    task.estimatedMinutes >= 15 &&
    task.estimatedMinutes <= 180 &&
    typeof task.priority === "number" &&
    task.priority >= 1 &&
    task.priority <= 5 &&
    typeof task.reasoning === "string" &&
    validTopicIds.has(task.topicId) &&
    validGoalIds.has(task.goalId)
  );
}

/**
 * Generates a daily study plan using AI
 */
export async function generateDailyPlan(
  userState: UserState,
  targetDate: string,
  ai: Ai
): Promise<DailyPlan> {
  // Analyze user state
  const activeGoals = userState.goals.filter((g) => g.status === "active");

  if (activeGoals.length === 0) {
    throw new Error("No active goals found. Create a goal first!");
  }

  // Get all topics from active goals
  const allTopics: Topic[] = [];
  const validTopicIds = new Set<string>();
  const validGoalIds = new Set<string>();

  for (const goal of activeGoals) {
    validGoalIds.add(goal.id);
    for (const topic of goal.topics) {
      allTopics.push(topic);
      validTopicIds.add(topic.id);
    }
  }

  // Get topics needing review
  const topicsNeedingReview = allTopics.filter((topic) => {
    if (!topic.lastReviewed) return true; // Never reviewed

    const daysSinceReview = Math.floor(
      (new Date().getTime() - new Date(topic.lastReviewed).getTime()) /
        (1000 * 60 * 60 * 24)
    );

    // Simple check: if it's been more than the spaced repetition interval, it needs review
    const intervals = [1, 3, 7, 14, 30];
    const interval = intervals[Math.min(topic.reviewCount, intervals.length - 1)] || 30;
    return daysSinceReview >= interval;
  });

  // Get recent study sessions (last 7 days)
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const recentSessions = userState.sessions.filter(
    (session) => new Date(session.date) >= sevenDaysAgo
  );

  // Build prompt context
  const context: PromptContext = {
    today: targetDate,
    activeGoals,
    topicsNeedingReview,
    recentSessions,
    allTopics,
  };

  // Build prompts
  const systemPrompt = buildSystemPrompt();
  const userPrompt = buildUserPrompt(context);

  // Call Workers AI with retry logic
  let aiResult: { reasoning: string; tasks: PlannedTask[] } | null = null;
  let attempts = 0;
  const maxAttempts = 3;

  while (attempts < maxAttempts && !aiResult) {
    try {
      const response = await ai.run("@cf/meta/llama-3-8b-instruct", {
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.7,
        max_tokens: 1500,
      });

      const responseText =
        response?.response || response?.result || response?.text || "{}";

      // Extract JSON from response
      const parsed = extractJSON(responseText);

      if (parsed && parsed.tasks && Array.isArray(parsed.tasks)) {
        // Validate and filter tasks
        const validTasks: PlannedTask[] = [];

        for (const task of parsed.tasks) {
          if (validateTask(task, validTopicIds, validGoalIds)) {
            validTasks.push(task);
          }
        }

        if (validTasks.length > 0) {
          aiResult = {
            reasoning:
              parsed.reasoning ||
              "AI-generated daily study plan based on your goals and topics.",
            tasks: validTasks,
          };
        }
      }
    } catch (error) {
      console.error(`AI call attempt ${attempts + 1} failed:`, error);
    }

    attempts++;
  }

  // Fallback if AI fails or returns invalid data
  if (!aiResult || aiResult.tasks.length === 0) {
    console.warn("AI plan generation failed, using fallback plan");

    // Create a simple fallback plan from topics needing review
    const fallbackTasks: PlannedTask[] = topicsNeedingReview
      .slice(0, 4)
      .map((topic) => {
        const goal = activeGoals.find((g) =>
          g.topics.some((t) => t.id === topic.id)
        );
        if (!goal) return null;

        return {
          topicId: topic.id,
          goalId: goal.id,
          type: "review" as const,
          estimatedMinutes: 45,
          priority: 4,
          reasoning: `Review ${topic.name} - ${topic.lastReviewed ? "last reviewed " + Math.floor((new Date().getTime() - new Date(topic.lastReviewed).getTime()) / (1000 * 60 * 60 * 24)) + " days ago" : "never reviewed"}`,
        };
      })
      .filter((t): t is PlannedTask => t !== null);

    if (fallbackTasks.length === 0) {
      throw new Error(
        "Could not generate plan: No valid topics available for planning"
      );
    }

    aiResult = {
      reasoning:
        "Generated a basic study plan focusing on topics that need review.",
      tasks: fallbackTasks,
    };
  }

  // Create DailyPlan object
  const dailyPlan: DailyPlan = {
    date: targetDate,
    generatedAt: new Date().toISOString(),
    tasks: aiResult.tasks,
    reasoning: aiResult.reasoning,
  };

  return dailyPlan;
}

