/**
 * Goal Card Component
 */

import { Goal, getDaysUntil, getUrgencyScore, calculateMemoryDecayLevel } from '../types';
import TopicDecayIndicator from './TopicDecayIndicator';

interface GoalCardProps {
  goal: Goal;
  onEdit?: (goal: Goal) => void;
  onDelete?: (goalId: string) => void;
}

export default function GoalCard({ goal, onEdit, onDelete }: GoalCardProps) {
  const daysUntil = getDaysUntil(goal.deadline);
  const urgency = getUrgencyScore(goal.deadline, goal.priority);

  const urgencyColor =
    urgency >= 80
      ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      : urgency >= 60
      ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
      : urgency >= 40
      ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
      : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';

  const deadlineStatus =
    daysUntil < 0
      ? 'Overdue'
      : daysUntil <= 7
      ? 'Urgent'
      : daysUntil <= 14
      ? 'Soon'
      : 'Upcoming';

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border-l-4 border-blue-500">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            {goal.title}
          </h3>
          <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
            <span className="capitalize px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded">
              {goal.type}
            </span>
            <span>
              Priority: {'★'.repeat(goal.priority)}
              {'☆'.repeat(5 - goal.priority)}
            </span>
            <span className={daysUntil < 0 ? 'text-red-600 dark:text-red-400' : ''}>
              {daysUntil < 0
                ? `${Math.abs(daysUntil)} days overdue`
                : `${daysUntil} days left`}
            </span>
          </div>
        </div>
        <div className="flex gap-2">
          <span
            className={`px-3 py-1 rounded-full text-xs font-semibold ${urgencyColor}`}
          >
            {urgency}% urgent
          </span>
          {onEdit && (
            <button
              onClick={() => onEdit(goal)}
              className="p-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
            >
              ✏️
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => onDelete(goal.id)}
              className="p-2 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400"
            >
              🗑️
            </button>
          )}
        </div>
      </div>

      <div className="mt-4">
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
          Deadline: {new Date(goal.deadline).toLocaleDateString()} ({deadlineStatus})
        </p>
        {goal.topics.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Topics ({goal.topics.length})
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {goal.topics.map((topic) => {
                const decayLevel = calculateMemoryDecayLevel(
                  topic.lastReviewed,
                  topic.reviewCount
                );
                return (
                  <div
                    key={topic.id}
                    className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 flex items-center justify-between"
                  >
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {topic.name}
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        Mastery: {topic.masteryLevel}% | Reviews: {topic.reviewCount}
                      </p>
                    </div>
                    <TopicDecayIndicator level={decayLevel} size="sm" />
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

