/**
 * Global App Context for State Management
 */

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Goal, DailyPlan, Topic } from '../types';
import { goalsApi, plansApi, reviewApi } from '../api/client';

interface AppContextType {
  goals: Goal[];
  todayPlan: DailyPlan | null;
  dailyPlans: DailyPlan[];
  reviewTopics: Topic[];
  loading: boolean;
  refreshGoals: () => Promise<void>;
  refreshTodayPlan: () => Promise<void>;
  refreshReviewTopics: () => Promise<void>;
  refreshAll: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [todayPlan, setTodayPlan] = useState<DailyPlan | null>(null);
  const [dailyPlans, setDailyPlans] = useState<DailyPlan[]>([]);
  const [reviewTopics, setReviewTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);

  const refreshGoals = async () => {
    try {
      const data = await goalsApi.getAll();
      setGoals(data);
    } catch (error) {
      console.error('Failed to refresh goals:', error);
    }
  };

  const refreshTodayPlan = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const plan = await plansApi.get(today);
      setTodayPlan(plan);
      if (plan) {
        setDailyPlans((prev) => {
          const filtered = prev.filter((p) => p.date !== plan.date);
          return [...filtered, plan];
        });
      }
    } catch (error) {
      console.error('Failed to refresh today plan:', error);
    }
  };

  const refreshReviewTopics = async () => {
    try {
      const topics = await reviewApi.getTopicsNeedingReview();
      setReviewTopics(topics);
    } catch (error) {
      console.error('Failed to refresh review topics:', error);
    }
  };

  const refreshAll = async () => {
    setLoading(true);
    await Promise.all([
      refreshGoals(),
      refreshTodayPlan(),
      refreshReviewTopics(),
    ]);
    setLoading(false);
  };

  useEffect(() => {
    refreshAll();
  }, []);

  return (
    <AppContext.Provider
      value={{
        goals,
        todayPlan,
        dailyPlans,
        reviewTopics,
        loading,
        refreshGoals,
        refreshTodayPlan,
        refreshReviewTopics,
        refreshAll,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
}

