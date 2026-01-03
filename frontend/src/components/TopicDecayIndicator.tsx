/**
 * Visual indicator for topic memory decay level
 */

import { MemoryDecayLevel } from '../types';

interface TopicDecayIndicatorProps {
  level: MemoryDecayLevel;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export default function TopicDecayIndicator({
  level,
  size = 'md',
  showLabel = false,
}: TopicDecayIndicatorProps) {
  const sizeClasses = {
    sm: 'w-2 h-2',
    md: 'w-3 h-3',
    lg: 'w-4 h-4',
  };

  const colorClasses = {
    green: 'bg-green-500',
    yellow: 'bg-yellow-500',
    orange: 'bg-orange-500',
    red: 'bg-red-500',
  };

  const labelColors = {
    green: 'text-green-700 dark:text-green-400',
    yellow: 'text-yellow-700 dark:text-yellow-400',
    orange: 'text-orange-700 dark:text-orange-400',
    red: 'text-red-700 dark:text-red-400',
  };

  return (
    <div className="flex items-center gap-2">
      <div
        className={`${sizeClasses[size]} ${colorClasses[level]} rounded-full`}
        title={level.toUpperCase()}
      />
      {showLabel && (
        <span className={`text-xs font-medium ${labelColors[level]}`}>
          {level.toUpperCase()}
        </span>
      )}
    </div>
  );
}

