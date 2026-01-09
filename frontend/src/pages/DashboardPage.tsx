/**
 * Dashboard Page - Main view
 */

import { useApp } from '../context/AppContext';
import DailyPlanView from '../components/DailyPlanView';
import GoalCard from '../components/GoalCard';
import Calendar from '../components/Calendar';
import MemoryMatrix from '../components/MemoryMatrix';
import TopicDecayIndicator from '../components/TopicDecayIndicator';
import { calculateMemoryDecayLevel, getUrgencyScore } from '../types';
import { goalsApi } from '../api/client';

export default function DashboardPage() {
  const { goals, todayPlan, reviewTopics, loading, refreshAll } = useApp();

  const activeGoals = goals.filter((g) => g.status === 'active');
  const urgentGoals = activeGoals
    .filter((g) => {
      const urgency = getUrgencyScore(g.deadline, g.priority);
      return urgency >= 70;
    })
    .slice(0, 3);

  const handleDeleteGoal = async (goalId: string) => {
    if (confirm('Are you sure you want to delete this goal?')) {
      try {
        await goalsApi.delete(goalId);
        refreshAll();
      } catch (error) {
        console.error('Failed to delete goal:', error);
        alert('Failed to delete goal. Please try again.');
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Study Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Welcome back! Here's your study overview for today.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <DailyPlanView plan={todayPlan} onRefresh={refreshAll} />
          </div>

          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Urgent Reviews
              </h2>
              {reviewTopics.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                  No topics need urgent review! 🎉
                </p>
              ) : (
                <div className="space-y-3">
                  {reviewTopics.slice(0, 5).map((topic) => {
                    const decayLevel = calculateMemoryDecayLevel(
                      topic.lastReviewed,
                      topic.reviewCount
                    );
                    return (
                      <div
                        key={topic.id}
                        className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                      >
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {topic.name}
                          </p>
                          <p className="text-xs text-gray-600 dark:text-gray-400">
                            {topic.masteryLevel}% mastery
                          </p>
                        </div>
                        <TopicDecayIndicator level={decayLevel} size="sm" />
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Quick Stats
              </h2>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Active Goals</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {activeGoals.length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Topics to Review</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {reviewTopics.length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Urgent Goals</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {urgentGoals.length}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {urgentGoals.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Urgent Goals
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {urgentGoals.map((goal) => (
                <GoalCard
                  key={goal.id}
                  goal={goal}
                  onDelete={handleDeleteGoal}
                />
              ))}
            </div>
          </div>
        )}

        <div className="mb-8">
          <Calendar />
        </div>

        <div>
          <MemoryMatrix />
        </div>
      </div>
    </div>
  );
}

