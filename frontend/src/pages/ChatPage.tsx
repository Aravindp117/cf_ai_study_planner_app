/**
 * Chat Page - Command chat interface
 */

import CommandChat from '../components/CommandChat';

export default function ChatPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
      <div className="max-w-4xl mx-auto h-[calc(100vh-2rem)]">
        <CommandChat />
      </div>
    </div>
  );
}

