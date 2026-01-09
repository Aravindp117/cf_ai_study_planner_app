/**
 * Memory decay and spaced repetition utility functions
 */

import { Topic, MemoryDecayLevel } from '../types';

/**
 * Get memory decay color based on last reviewed date
 */
export function getDecayColor(lastReviewed: string | null): MemoryDecayLevel {
  if (!lastReviewed) {
    return 'red'; // Never reviewed
  }

  const now = new Date();
  const lastReviewDate = new Date(lastReviewed);
  const daysSinceReview = Math.floor(
    (now.getTime() - lastReviewDate.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (daysSinceReview < 3) {
    return 'green';
  } else if (daysSinceReview < 7) {
    return 'yellow';
  } else if (daysSinceReview < 14) {
    return 'orange';
  } else {
    return 'red';
  }
}

/**
 * Get next review date based on spaced repetition intervals
 */
export function getNextReviewDate(
  lastReviewed: string | null,
  reviewCount: number
): string | null {
  if (!lastReviewed) {
    return null;
  }

  const intervals = [1, 3, 7, 14, 30];
  const interval = intervals[Math.min(reviewCount, intervals.length - 1)] || 30;

  const lastReviewDate = new Date(lastReviewed);
  const nextReviewDate = new Date(lastReviewDate);
  nextReviewDate.setDate(nextReviewDate.getDate() + interval);

  return nextReviewDate.toISOString();
}

/**
 * Calculate urgency score for a topic (0-100, higher = more urgent)
 */
export function getUrgencyScore(topic: Topic): number {
  const decayColor = getDecayColor(topic.lastReviewed);
  const decayScores = { red: 100, orange: 70, yellow: 40, green: 10 };

  const baseScore = decayScores[decayColor];

  // Adjust based on review count (fewer reviews = slightly more urgent)
  const reviewAdjustment = Math.max(0, 20 - topic.reviewCount * 2);

  // Adjust based on mastery (lower mastery = more urgent)
  const masteryAdjustment = (100 - topic.masteryLevel) * 0.1;

  return Math.min(100, Math.round(baseScore + reviewAdjustment + masteryAdjustment));
}

/**
 * Check if topic is due for review
 */
export function isDueForReview(topic: Topic): boolean {
  if (!topic.lastReviewed) {
    return true; // Never reviewed
  }

  const nextReview = getNextReviewDate(topic.lastReviewed, topic.reviewCount);
  if (!nextReview) {
    return true;
  }

  const now = new Date();
  const nextReviewDate = new Date(nextReview);
  return now >= nextReviewDate;
}

/**
 * Get days until next review
 */
export function getDaysUntilReview(topic: Topic): number | null {
  const nextReview = getNextReviewDate(topic.lastReviewed, topic.reviewCount);
  if (!nextReview) {
    return null;
  }

  const now = new Date();
  const nextReviewDate = new Date(nextReview);
  const days = Math.ceil(
    (nextReviewDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
  );

  return days;
}

