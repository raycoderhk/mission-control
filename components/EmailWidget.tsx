'use client';

import { useState, useEffect } from 'react';

interface Email {
  id: string;
  subject: string;
  from: string;
  date: string;
  priority: 'urgent' | 'high' | 'medium' | 'low';
  isRead: boolean;
  hasAction: boolean;
  kanbanTask?: string;
}

export default function EmailWidget() {
  const [emails, setEmails] = useState<Email[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastCheck, setLastCheck] = useState<string>('');

  useEffect(() => {
    fetchEmails();
    // Refresh every 5 minutes
    const interval = setInterval(fetchEmails, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  async function fetchEmails() {
    try {
      const response = await fetch('/api/emails');
      const data = await response.json();
      setEmails(data.emails || []);
      setLastCheck(data.lastCheck || new Date().toLocaleString('zh-HK'));
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch emails:', error);
      setLoading(false);
    }
  }

  const priorityColors = {
    urgent: 'bg-red-100 border-red-500 text-red-800',
    high: 'bg-orange-100 border-orange-500 text-orange-800',
    medium: 'bg-yellow-100 border-yellow-500 text-yellow-800',
    low: 'bg-green-100 border-green-500 text-green-800',
  };

  const priorityLabels = {
    urgent: '🔴 緊急',
    high: '🟠 重要',
    medium: '🟡 普通',
    low: '🟢 低',
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">📬 電郵收件箱</h3>
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="h-4 bg-gray-200 rounded w-5/6"></div>
        </div>
      </div>
    );
  }

  const unreadCount = emails.filter(e => !e.isRead).length;
  const actionRequired = emails.filter(e => e.hasAction).length;

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-800">📬 電郵收件箱</h3>
        <span className="text-xs text-gray-500">最後檢查：{lastCheck}</span>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="bg-blue-50 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-blue-600">{emails.length}</div>
          <div className="text-xs text-blue-600">今日電郵</div>
        </div>
        <div className="bg-red-50 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-red-600">{unreadCount}</div>
          <div className="text-xs text-red-600">未讀</div>
        </div>
        <div className="bg-orange-50 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-orange-600">{actionRequired}</div>
          <div className="text-xs text-orange-600">需行動</div>
        </div>
      </div>

      {/* Email List */}
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {emails.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <div className="text-4xl mb-2">📭</div>
            <div>暫無新電郵</div>
          </div>
        ) : (
          emails.map((email) => (
            <div
              key={email.id}
              className={`p-3 rounded-lg border-l-4 cursor-pointer hover:shadow-md transition-shadow ${
                priorityColors[email.priority]
              } ${email.isRead ? 'opacity-75' : 'opacity-100'}`}
            >
              <div className="flex justify-between items-start mb-1">
                <h4 className="font-medium text-sm text-gray-900 truncate flex-1">
                  {email.subject}
                </h4>
                {!email.isRead && (
                  <span className="ml-2 px-2 py-0.5 bg-red-500 text-white text-xs rounded-full">
                    新
                  </span>
                )}
              </div>
              <div className="text-xs text-gray-600 mb-1">{email.from}</div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-500">
                  {new Date(email.date).toLocaleString('zh-HK', {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-xs">{priorityLabels[email.priority]}</span>
                  {email.kanbanTask && (
                    <span className="px-1.5 py-0.5 bg-purple-100 text-purple-700 text-xs rounded">
                      {email.kanbanTask}
                    </span>
                  )}
                  {email.hasAction && (
                    <span className="px-1.5 py-0.5 bg-orange-100 text-orange-700 text-xs rounded">
                      ⚠️ 需行動
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* View All Link */}
      <div className="mt-4 pt-4 border-t border-gray-200 text-center">
        <a
          href="https://mail.google.com"
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-blue-600 hover:text-blue-700 hover:underline"
        >
          前往 Gmail 查看所有電郵 →
        </a>
      </div>
    </div>
  );
}
