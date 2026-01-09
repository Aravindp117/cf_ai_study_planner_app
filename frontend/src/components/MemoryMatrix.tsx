/**
 * Memory Matrix Component - Visualize topic memory decay
 */

import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Topic, Goal } from '../types';
import { getDecayColor, getNextReviewDate, getUrgencyScore, isDueForReview, getDaysUntilReview } from '../utils/memory';
import TopicDecayIndicator from './TopicDecayIndicator';
import StudySessionModal from './StudySessionModal';
import { format } from 'date-fns';

export default function MemoryMatrix() {
  const { goals } = useApp();
  const [selectedTopic, setSelectedTopic] = useState<{ topic: Topic; goal: Goal } | null>(null);
  const [showSessionModal, setShowSessionModal] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Collect all topics with their goals
  const topicsWithGoals: Array<{ topic: Topic; goal: Goal }> = [];
  goals.forEach((goal) => {
    if (goal.status === 'active') {
      goal.topics.forEach((topic) => {
        topicsWithGoals.push({ topic, goal });
      });
    }
  });

  // Sort by urgency (red topics first)
  const sortedTopics = [...topicsWithGoals].sort((a, b) => {
    const urgencyA = getUrgencyScore(a.topic);
    const urgencyB = getUrgencyScore(b.topic);
    return urgencyB - urgencyA;
  });

  const handleTopicClick = (topic: Topic, goal: Goal) => {
    setSelectedTopic({ topic, goal });
    setShowSessionModal(true);
  };

  const getDecayColorClass = (decayLevel: string): string => {
    switch (decayLevel) {
      case 'red':
        return 'bg-red-50 dark:bg-red-900/20 border-red-300 dark:border-red-700';
      case 'orange':
        return 'bg-orange-50 dark:bg-orange-900/20 border-orange-300 dark:border-orange-700';
      case 'yellow':
        return 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-300 dark:border-yellow-700';
      case 'green':
        return 'bg-green-50 dark:bg-green-900/20 border-green-300 dark:border-green-700';
      default:
        return 'bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600';
    }
  };

  if (sortedTopics.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center">
        <p className="text-gray-500 dark:text-gray-400">
          No topics found. Create goals and add topics to see memory decay visualization.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-4 mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Memory Matrix</h2>
        <div className="flex gap-2 flex-shrink-0">
          <button
            onClick={() => setViewMode('grid')}
            className={`px-3 sm:px-4 py-2 rounded-lg font-medium transition-colors text-sm sm:text-base whitespace-nowrap ${
              viewMode === 'grid'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
            }`}
          >
            Grid
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`px-3 sm:px-4 py-2 rounded-lg font-medium transition-colors text-sm sm:text-base whitespace-nowrap ${
              viewMode === 'list'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
            }`}
          >
            List
          </button>
        </div>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-3 sm:gap-4 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-green-500 rounded-full flex-shrink-0"></div>
          <span className="whitespace-nowrap">Fresh (&lt; 3 days)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-yellow-500 rounded-full flex-shrink-0"></div>
          <span className="whitespace-nowrap">Good (3-7 days)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-orange-500 rounded-full flex-shrink-0"></div>
          <span className="whitespace-nowrap">Decaying (7-14 days)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-red-500 rounded-full flex-shrink-0"></div>
          <span className="whitespace-nowrap">Urgent (&gt; 14 days)</span>
        </div>
      </div>

      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sortedTopics.map(({ topic, goal }) => {
            const decayLevel = getDecayColor(topic.lastReviewed);
            const nextReview = getNextReviewDate(topic.lastReviewed, topic.reviewCount);
            const daysUntil = getDaysUntilReview(topic);
            const isDue = isDueForReview(topic);

            return (
              <div
                key={topic.id}
                className={`p-4 rounded-lg border-2 transition-all hover:shadow-lg ${getDecayColorClass(
                  decayLevel
                )} ${isDue ? 'ring-2 ring-red-500' : ''}`}
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-gray-900 dark:text-white">{topic.name}</h3>
                  <TopicDecayIndicator level={decayLevel} size="sm" />
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{goal.title}</p>
                <div className="space-y-1 text-xs text-gray-600 dark:text-gray-400 mb-3">
                  <div className="flex justify-between">
                    <span>Mastery:</span>
                    <span className="font-medium">{topic.masteryLevel}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Reviews:</span>
                    <span className="font-medium">{topic.reviewCount}</span>
                  </div>
                  {topic.lastReviewed ? (
                    <div className="flex justify-between">
                      <span>Last reviewed:</span>
                      <span className="font-medium">
                        {format(new Date(topic.lastReviewed), 'MMM d')}
                      </span>
                    </div>
                  ) : (
                    <div className="text-red-600 dark:text-red-400 font-medium">
                      Never reviewed
                    </div>
                  )}
                  {nextReview && (
                    <div className="flex justify-between">
                      <span>Next review:</span>
                      <span className={`font-medium ${isDue ? 'text-red-600 dark:text-red-400' : ''}`}>
                        {daysUntil !== null
                          ? daysUntil <= 0
                            ? 'Due now!'
                            : `in ${daysUntil} days`
                          : format(new Date(nextReview), 'MMM d')}
                      </span>
                    </div>
                  )}
                </div>
                {isDue && (
                  <div className="mt-2 mb-3 text-xs font-semibold text-red-600 dark:text-red-400">
                    ⚠️ Due for review
                  </div>
                )}
                <button
                  onClick={() => handleTopicClick(topic, goal)}
                  className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors text-sm"
                >
                  Log Session
                </button>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="space-y-2">
          {sortedTopics.map(({ topic, goal }) => {
            const decayLevel = getDecayColor(topic.lastReviewed);
            const nextReview = getNextReviewDate(topic.lastReviewed, topic.reviewCount);
            const daysUntil = getDaysUntilReview(topic);
            const isDue = isDueForReview(topic);

            return (
              <div
                key={topic.id}
                className={`p-4 rounded-lg border-2 transition-all hover:shadow-md ${getDecayColorClass(
                  decayLevel
                )} ${isDue ? 'ring-2 ring-red-500' : ''}`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-gray-900 dark:text-white">{topic.name}</h3>
                      <TopicDecayIndicator level={decayLevel} size="sm" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">{goal.title}</span>
                    </div>
                    <div className="grid grid-cols-4 gap-4 text-sm text-gray-600 dark:text-gray-400">
                      <div>
                        <span className="font-medium">Mastery:</span> {topic.masteryLevel}%
                      </div>
                      <div>
                        <span className="font-medium">Reviews:</span> {topic.reviewCount}
                      </div>
                      <div>
                        <span className="font-medium">Last:</span>{' '}
                        {topic.lastReviewed
                          ? format(new Date(topic.lastReviewed), 'MMM d, yyyy')
                          : 'Never'}
                      </div>
                      <div>
                        <span className="font-medium">Next:</span>{' '}
                        {nextReview
                          ? daysUntil !== null
                            ? daysUntil <= 0
                              ? 'Due now!'
                              : `in ${daysUntil} days`
                            : format(new Date(nextReview), 'MMM d')
                          : 'N/A'}
                      </div>
                    </div>
                  </div>
                  {isDue && (
                    <div className="ml-4 px-3 py-1 bg-red-600 text-white rounded-lg text-sm font-semibold">
                      Review Due
                    </div>
                  )}
                </div>
                <button
                  onClick={() => handleTopicClick(topic, goal)}
                  className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors text-sm"
                >
                  Log Session
                </button>
              </div>
            );
          })}
        </div>
      )}

      {showSessionModal && selectedTopic && (
        <StudySessionModal
          isOpen={showSessionModal}
          onClose={() => {
            setShowSessionModal(false);
            setSelectedTopic(null);
          }}
          goal={selectedTopic.goal}
          topic={selectedTopic.topic}
        />
      )}
    </div>
  );
}

