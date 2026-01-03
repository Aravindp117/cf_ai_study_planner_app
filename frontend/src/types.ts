/**
 * Frontend TypeScript Types for Study Planner
 */

export interface Goal {
  id: string;
  title: string;
  type: 'exam' | 'project' | 'commitment';
  deadline: string;
  priority: number; // 1-5
  topics: Topic[];
  status: 'active' | 'completed' | 'archived';
  createdAt: string;
}

export interface Topic {
  id: string;
  goalId: string;
  name: string;
  lastReviewed: string | null;
  reviewCount: number;
  masteryLevel: number; // 0-100
  notes: string;
}

export interface StudySession {
  id: string;
  topicId: string;
  goalId: string;
  date: string;
  durationMinutes: number;
  notes: string;
}

export interface DailyPlan {
  date: string;
  generatedAt: string;
  tasks: PlannedTask[];
  reasoning: string;
}

export interface PlannedTask {
  topicId: string;
  goalId: string;
  type: 'study' | 'review' | 'project_work';
  estimatedMinutes: number;
  priority: number; // 1-5
  reasoning: string;
}

export interface UserState {
  userId: string;
  goals: Goal[];
  sessions: StudySession[];
  dailyPlans: DailyPlan[];
  lastPlanGenerated: string | null;
}

export type MemoryDecayLevel = 'green' | 'yellow' | 'orange' | 'red';

export interface GoalWithDecay extends Goal {
  topicsWithDecay?: Array<Topic & { decayLevel: MemoryDecayLevel }>;
}

// Helper functions
export function calculateMemoryDecayLevel(
  lastReviewed: string | null,
  reviewCount: number
): MemoryDecayLevel {
  if (!lastReviewed) return 'red';

  const now = new Date();
  const lastReviewDate = new Date(lastReviewed);
  const daysSinceReview = Math.floor(
    (now.getTime() - lastReviewDate.getTime()) / (1000 * 60 * 60 * 24)
  );

  const intervals = [1, 3, 7, 14, 30];
  const interval = intervals[Math.min(reviewCount, intervals.length - 1)] || 30;

  if (daysSinceReview < interval * 0.5) return 'green';
  if (daysSinceReview < interval) return 'yellow';
  if (daysSinceReview < interval * 1.5) return 'orange';
  return 'red';
}

export function getUrgencyScore(deadline: string, priority: number): number {
  const now = new Date();
  const deadlineDate = new Date(deadline);
  const daysUntilDeadline = Math.floor(
    (deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
  );

  const priorityScore = (priority / 5) * 50;
  let timeScore = 0;

  if (daysUntilDeadline < 0) {
    timeScore = 50;
  } else if (daysUntilDeadline <= 7) {
    timeScore = 50;
  } else if (daysUntilDeadline <= 14) {
    timeScore = 40;
  } else if (daysUntilDeadline <= 30) {
    timeScore = 30;
  } else if (daysUntilDeadline <= 60) {
    timeScore = 20;
  } else {
    timeScore = 10;
  }

  return Math.min(100, Math.round(priorityScore + timeScore));
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function getDaysUntil(deadline: string): number {
  const now = new Date();
  const deadlineDate = new Date(deadline);
  return Math.ceil(
    (deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
  );
}

