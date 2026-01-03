/**
 * Calendar Page - Week/Month view with planned tasks
 */

import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { DailyPlan } from '../types';
import { plansApi } from '../api/client';

export default function CalendarPage() {
  const { dailyPlans } = useApp();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [viewMode, setViewMode] = useState<'week' | 'month'>('week');

  // Get days for current week
  const getWeekDays = () => {
    const today = new Date(selectedDate);
    const dayOfWeek = today.getDay();
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - dayOfWeek);

    const days = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      days.push(date.toISOString().split('T')[0]);
    }
    return days;
  };

  const weekDays = getWeekDays();
  const selectedPlan = dailyPlans.find((p) => p.date === selectedDate);

  const getPlanForDate = (date: string): DailyPlan | undefined => {
    return dailyPlans.find((p) => p.date === date);
  };

  const handleGeneratePlan = async (date: string) => {
    try {
      await plansApi.generate(date);
      // Refresh would be handled by context
    } catch (error) {
      console.error('Failed to generate plan:', error);
      alert('Failed to generate plan. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Study Calendar
            </h1>
            <div className="flex gap-2">
              <button
                onClick={() => setViewMode('week')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  viewMode === 'week'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
                }`}
              >
                Week
              </button>
              <button
                onClick={() => setViewMode('month')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  viewMode === 'month'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
                }`}
              >
                Month
              </button>
            </div>
          </div>
        </div>

        {viewMode === 'week' && (
          <div className="grid grid-cols-7 gap-4 mb-6">
            {weekDays.map((date) => {
              const plan = getPlanForDate(date);
              const isToday = date === new Date().toISOString().split('T')[0];
              const isSelected = date === selectedDate;

              return (
                <div
                  key={date}
                  onClick={() => setSelectedDate(date)}
                  className={`bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 cursor-pointer transition-all ${
                    isSelected ? 'ring-2 ring-blue-500' : ''
                  } ${isToday ? 'border-2 border-blue-500' : ''}`}
                >
                  <div className="text-center">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {new Date(date).toLocaleDateString('en-US', { weekday: 'short' })}
                    </p>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">
                      {new Date(date).getDate()}
                    </p>
                    {plan && (
                      <div className="mt-2">
                        <p className="text-xs text-blue-600 dark:text-blue-400">
                          {plan.tasks.length} tasks
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          {plan.tasks.reduce((sum, t) => sum + t.estimatedMinutes, 0)} min
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Plan for {new Date(selectedDate).toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </h2>
            {!selectedPlan && (
              <button
                onClick={() => handleGeneratePlan(selectedDate)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
              >
                Generate Plan
              </button>
            )}
          </div>

          {selectedPlan ? (
            <div>
              <p className="text-gray-700 dark:text-gray-300 mb-4">{selectedPlan.reasoning}</p>
              <div className="space-y-3">
                {selectedPlan.tasks.map((task, index) => {
                  const taskTypeEmoji =
                    task.type === 'review' ? '🔄' : task.type === 'study' ? '📚' : '💼';
                  return (
                    <div
                      key={index}
                      className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 border-l-4 border-blue-500"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-lg">{taskTypeEmoji}</span>
                            <span className="font-medium text-gray-900 dark:text-white">
                              Task {index + 1}
                            </span>
                          </div>
                          <p className="text-sm text-gray-700 dark:text-gray-300">
                            {task.reasoning}
                          </p>
                        </div>
                        <div className="text-right ml-4">
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {task.estimatedMinutes} min
                          </p>
                          <p className="text-xs text-gray-600 dark:text-gray-400">
                            Priority: {'★'.repeat(task.priority)}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <p className="text-gray-500 dark:text-gray-400">
              No plan generated for this date. Click "Generate Plan" to create one.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

