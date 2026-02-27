"use client";

import { useEffect, useState } from "react";
import eventsData from "../data/events.json";
import friendsData from "../data/friends.json";
import tasksData from "../data/tasks.json";
import goalsData from "../data/goals.json";
import analyticsData from "../data/analytics.json";

export default function Home() {
  const [analytics, setAnalytics] = useState(analyticsData);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Fetch real-time analytics data on mount
    const fetchAnalytics = async () => {
      setIsLoading(true);
      try {
        const response = await fetch("/api/analytics");
        if (response.ok) {
          const data = await response.json();
          setAnalytics(data);
        }
      } catch (error) {
        console.error("Failed to fetch analytics, using cached data:", error);
        // Fall back to cached data (already set as initial state)
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalytics();
    
    // Refresh every 5 minutes
    const interval = setInterval(fetchAnalytics, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const today = new Date();
  const upcomingEvents = eventsData.upcoming.slice(0, 5);
  const pendingTasks = tasksData.tasks.filter((t) => t.status === "pending");
  const friends = friendsData.friends;
  const monthlyGoals = goalsData.monthly;
  const quarterlyGoals = goalsData.quarterly;
  const yearlyGoals = goalsData.yearly;
  const categories = goalsData.categories;

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8">
      {/* Header */}
      <header className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">
          🚀 Mission Control
        </h1>
        <p className="text-gray-400">
          Raymond&apos;s Productivity Dashboard
        </p>
        <p className="text-gray-500 text-sm mt-1">
          {today.toLocaleDateString("en-HK", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>
      </header>

      {/* Dashboard Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Upcoming Events */}
        <DashboardCard title="📅 Upcoming Events" color="blue">
          <div className="space-y-3">
            {upcomingEvents.map((event) => (
              <div
                key={event.id}
                className="bg-slate-800/50 rounded-lg p-3 border-l-4 border-blue-500"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-white">{event.title}</h3>
                    <p className="text-sm text-gray-400">
                      {event.date} · {event.time}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">{event.location}</p>
                  </div>
                  <PriorityBadge priority={event.priority} />
                </div>
                {event.notes && (
                  <p className="text-xs text-gray-500 mt-2 italic">{event.notes}</p>
                )}
              </div>
            ))}
          </div>
        </DashboardCard>

        {/* Pending Tasks */}
        <DashboardCard title="✅ Pending Tasks" color="green">
          <div className="space-y-3">
            {pendingTasks.slice(0, 5).map((task) => (
              <div
                key={task.id}
                className="bg-slate-800/50 rounded-lg p-3 border-l-4 border-green-500"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-white">{task.title}</h3>
                    <p className="text-sm text-gray-400">{task.description}</p>
                  </div>
                  <span className="text-xs bg-slate-700 text-gray-300 px-2 py-1 rounded">
                    Due: {task.dueDate}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </DashboardCard>

        {/* Friends & Meetups */}
        <DashboardCard title="👥 Friends & Meetups" color="purple">
          <div className="space-y-3">
            {friends.map((friend) => (
              <div
                key={friend.id}
                className="bg-slate-800/50 rounded-lg p-3 border-l-4 border-purple-500"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-white">{friend.name}</h3>
                    <p className="text-sm text-gray-400">{friend.relationship}</p>
                  </div>
                </div>
                {friend.nextMeetup && (
                  <p className="text-xs text-blue-400 mt-2">
                    Next: {friend.nextMeetup}
                  </p>
                )}
                {friend.recentNews && (
                  <p className="text-xs text-green-400 mt-1 italic">
                    🎉 {friend.recentNews}
                  </p>
                )}
              </div>
            ))}
          </div>
        </DashboardCard>

        {/* Goal Tracker */}
        <DashboardCard title="🎯 Goal Tracker" color="red" fullWidth>
          <div className="space-y-6">
            {/* Monthly Goals */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-3">📅 Monthly Goals (March)</h3>
              <div className="space-y-3">
                {monthlyGoals.map((goal) => (
                  <GoalItem key={goal.id} goal={goal} categories={categories} />
                ))}
              </div>
            </div>

            {/* Quarterly Goals */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-3">📊 Quarterly Goals (Q2 2026)</h3>
              <div className="space-y-3">
                {quarterlyGoals.map((goal) => (
                  <GoalItem key={goal.id} goal={goal} categories={categories} />
                ))}
              </div>
            </div>

            {/* Yearly Goals */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-3">🏆 Yearly Goals (2026)</h3>
              <div className="space-y-3">
                {yearlyGoals.map((goal) => (
                  <GoalItem key={goal.id} goal={goal} categories={categories} />
                ))}
              </div>
            </div>
          </div>
        </DashboardCard>

        {/* Analytics Dashboard */}
        <DashboardCard title="📈 Analytics Dashboard" color="blue" fullWidth>
          {isLoading && (
            <div className="mb-4 text-sm text-blue-400 animate-pulse">
              🔄 Fetching real-time data...
            </div>
          )}
          <div className="space-y-6">
            {/* API Usage */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-slate-800/50 rounded-lg p-4">
                <div className="text-sm text-gray-400 mb-1">API Usage (This Month)</div>
                <div className="text-2xl font-bold text-white">
                  {analytics.apiUsage.current.thisMonth.toLocaleString()} / {analytics.apiUsage.quota.toLocaleString()}
                </div>
                <div className="mt-2">
                  <div className="w-full bg-slate-700 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${analytics.apiUsage.current.percentageUsed < 50 ? 'bg-green-500' : analytics.apiUsage.current.percentageUsed < 80 ? 'bg-yellow-500' : 'bg-red-500'}`}
                      style={{ width: `${analytics.apiUsage.current.percentageUsed}%` }}
                    />
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    {analytics.apiUsage.current.percentageUsed}% used · {analytics.apiUsage.current.remaining.toLocaleString()} remaining
                  </div>
                </div>
              </div>

              <div className="bg-slate-800/50 rounded-lg p-4">
                <div className="text-sm text-gray-400 mb-1">Monthly Cost</div>
                <div className="text-2xl font-bold text-white">
                  ${analytics.costs.monthly.spent.toFixed(2)} / ${analytics.costs.monthly.budget.toFixed(2)}
                </div>
                <div className="mt-2">
                  <div className="w-full bg-slate-700 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${analytics.costs.monthly.percentageUsed < 80 ? 'bg-green-500' : 'bg-yellow-500'}`}
                      style={{ width: `${analytics.costs.monthly.percentageUsed}%` }}
                    />
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    {analytics.costs.monthly.percentageUsed}% of budget
                  </div>
                </div>
              </div>

              <div className="bg-slate-800/50 rounded-lg p-4">
                <div className="text-sm text-gray-400 mb-1">Active Agents</div>
                <div className="text-2xl font-bold text-white">
                  {analytics.agents.active} / 4
                </div>
                <div className="mt-2 space-y-1">
                  {analytics.agents.list.map((agent) => (
                    <div key={agent.id} className="flex justify-between text-xs">
                      <span className="text-gray-300">{agent.name}</span>
                      <span className="text-gray-400">{agent.requestsToday} req today</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Cost Breakdown */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-3">💰 Cost Breakdown</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {analytics.costs.breakdown.map((item, idx) => (
                  <div key={idx} className="bg-slate-800/50 rounded-lg p-4">
                    <div className="text-sm text-gray-400 mb-1">{item.service}</div>
                    <div className="text-xl font-bold text-white">${item.spent.toFixed(2)}</div>
                    <div className={`text-xs mt-1 ${item.status === 'under-budget' ? 'text-green-400' : item.status === 'free-tier' ? 'text-blue-400' : 'text-gray-400'}`}>
                      {item.status === 'under-budget' && `Under budget ($${item.budget.toFixed(2)})`}
                      {item.status === 'free-tier' && 'Free tier'}
                      {item.status === 'free' && 'Free'}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* System Status */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-3">🖥️ System Status</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Gateway */}
                <div className="bg-slate-800/50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                    <h4 className="font-semibold text-white">Gateway</h4>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Platform:</span>
                      <span className="text-white">{analytics.system.gateway.platform} ({analytics.system.gateway.region})</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Uptime:</span>
                      <span className="text-green-400">{analytics.system.gateway.uptime} ({analytics.system.gateway.uptimeDays} days)</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Status:</span>
                      <span className="text-green-400">Running</span>
                    </div>
                  </div>
                </div>

                {/* Channels */}
                <div className="bg-slate-800/50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                    <h4 className="font-semibold text-white">Channels</h4>
                  </div>
                  <div className="space-y-2">
                    {Object.entries(analytics.system.channels).map(([name, channel]: [string, any]) => (
                      <div key={name} className="flex justify-between items-center text-sm">
                        <span className="text-gray-300 capitalize">{name}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-400">{channel.type}</span>
                          <span className={`text-xs px-2 py-0.5 rounded ${channel.status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                            {channel.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Active Tools */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-3">🛠️ Active Tools</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {analytics.projects.activeTools.map((tool, idx) => (
                  <div key={idx} className="bg-slate-800/50 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className={`w-2 h-2 rounded-full ${tool.status === 'working' || tool.status === 'deployed' ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                      <h4 className="font-semibold text-white text-sm">{tool.name}</h4>
                    </div>
                    <div className="text-xs text-gray-400 mb-2">
                      Status: <span className="text-green-400">{tool.status}</span>
                    </div>
                    <div className="text-xs text-gray-500">
                      Data: {tool.dataSource}
                    </div>
                    {tool.url && (
                      <a 
                        href={tool.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-xs text-blue-400 hover:underline mt-1 block"
                      >
                        Open →
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Savings Highlight */}
            <div className="bg-gradient-to-r from-green-500/20 to-blue-500/20 rounded-lg p-4 border border-green-500/30">
              <div className="flex items-start gap-3">
                <div className="text-3xl">💰</div>
                <div>
                  <h4 className="font-semibold text-white mb-1">Cost Optimization Success!</h4>
                  <p className="text-sm text-gray-300">
                    Switched from DeepSeek to Aliyun: <span className="text-green-400 font-bold">Saved ${analytics.costs.savings.vsDeepSeek.amount}/month ({analytics.costs.savings.vsDeepSeek.percentage}% savings)</span>
                  </p>
                  <p className="text-xs text-gray-400 mt-1">{analytics.costs.savings.vsDeepSeek.note}</p>
                </div>
              </div>
            </div>

            {/* Last Updated */}
            <div className="text-xs text-gray-500 text-center">
              Last updated: {analytics.lastUpdated ? new Date(analytics.lastUpdated).toLocaleString() : 'N/A'}
              {analytics.apiUsage?.note && (
                <div className="mt-1 text-blue-400">⚠️ {analytics.apiUsage.note}</div>
              )}
            </div>
          </div>
        </DashboardCard>

        {/* Quick Stats */}
        <DashboardCard title="📊 Quick Stats" color="yellow">
          <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
            <StatBox label="Events" value={eventsData.upcoming.length} color="blue" />
            <StatBox label="Tasks" value={pendingTasks.length} color="green" />
            <StatBox label="Friends" value={friends.length} color="purple" />
            <StatBox label="Goals" value={monthlyGoals.length + quarterlyGoals.length + yearlyGoals.length} color="red" />
            <StatBox label="API Used" value={analytics.apiUsage.current.percentageUsed} color="green" suffix="%" />
            <StatBox label="Cost" value={analytics.costs.monthly.percentageUsed} color="blue" suffix="%" />
          </div>
        </DashboardCard>

        {/* Conversation Starters */}
        <DashboardCard title="💬 Conversation Starters" color="pink" fullWidth>
          <div className="space-y-4">
            {friends.map((friend) => (
              <div key={friend.id} className="bg-slate-800/50 rounded-lg p-4">
                <h3 className="font-semibold text-white mb-2">{friend.name}</h3>
                <div className="flex flex-wrap gap-2">
                  {friend.conversationTopics.map((topic, idx) => (
                    <span
                      key={idx}
                      className="text-xs bg-slate-700 text-gray-300 px-3 py-1 rounded-full"
                    >
                      {topic}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </DashboardCard>
      </div>

      {/* Footer */}
      <footer className="mt-8 text-center text-gray-500 text-sm">
        <p>Mission Control · Built with NextJS · Local Host</p>
      </footer>
    </main>
  );
}

// Components
function DashboardCard({
  title,
  color,
  children,
  fullWidth = false,
}: {
  title: string;
  color: string;
  children: React.ReactNode;
  fullWidth?: boolean;
}) {
  const colorClasses: Record<string, string> = {
    blue: "border-blue-500",
    green: "border-green-500",
    purple: "border-purple-500",
    yellow: "border-yellow-500",
    pink: "border-pink-500",
    red: "border-red-500",
  };

  return (
    <div
      className={`bg-slate-800/30 backdrop-blur-sm rounded-xl p-6 border ${
        colorClasses[color] || "border-gray-500"
      } ${fullWidth ? "md:col-span-2 lg:col-span-3" : ""}`}
    >
      <h2 className="text-xl font-bold text-white mb-4">{title}</h2>
      {children}
    </div>
  );
}

function StatBox({
  label,
  value,
  color,
  suffix = "",
}: {
  label: string;
  value: number;
  color: string;
  suffix?: string;
}) {
  const colorClasses: Record<string, string> = {
    blue: "bg-blue-500/20 text-blue-400",
    green: "bg-green-500/20 text-green-400",
    purple: "bg-purple-500/20 text-purple-400",
    red: "bg-red-500/20 text-red-400",
    yellow: "bg-yellow-500/20 text-yellow-400",
  };

  return (
    <div className={`${colorClasses[color]} rounded-lg p-4 text-center`}>
      <div className="text-2xl font-bold">{value}{suffix}</div>
      <div className="text-xs opacity-80">{label}</div>
    </div>
  );
}

function PriorityBadge({ priority }: { priority: string }) {
  const colors: Record<string, string> = {
    high: "bg-red-500/20 text-red-400",
    medium: "bg-yellow-500/20 text-yellow-400",
    low: "bg-green-500/20 text-green-400",
  };

  return (
    <span className={`text-xs px-2 py-1 rounded ${colors[priority] || colors.low}`}>
      {priority}
    </span>
  );
}

function GoalItem({ goal, categories }: { goal: any; categories: any }) {
  const category = categories[goal.category] || categories.personal;
  const progress = Math.round((goal.current / goal.target) * 100);
  
  const statusColors: Record<string, string> = {
    "not-started": "bg-gray-500/20 text-gray-400",
    "in-progress": "bg-blue-500/20 text-blue-400",
    "completed": "bg-green-500/20 text-green-400",
  };

  const statusLabels: Record<string, string> = {
    "not-started": "未開始",
    "in-progress": "進行中",
    "completed": "已完成",
  };

  return (
    <div className="bg-slate-800/50 rounded-lg p-4 border-l-4" style={{ borderColor: `var(--${category.color}-500)` }}>
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center gap-2">
          <span className="text-xl">{category.icon}</span>
          <div>
            <h4 className="font-semibold text-white">{goal.title}</h4>
            <p className="text-xs text-gray-400">{goal.description}</p>
          </div>
        </div>
        <span className={`text-xs px-2 py-1 rounded ${statusColors[goal.status]}`}>
          {statusLabels[goal.status]}
        </span>
      </div>
      
      {/* Progress Bar */}
      <div className="mt-3">
        <div className="flex justify-between text-xs text-gray-400 mb-1">
          <span>Progress</span>
          <span>{goal.current} / {goal.target} {goal.unit} ({progress}%)</span>
        </div>
        <div className="w-full bg-slate-700 rounded-full h-2">
          <div 
            className={`h-2 rounded-full transition-all duration-300`}
            style={{ 
              width: `${progress}%`,
              backgroundColor: `var(--${category.color}-500)`
            }}
          />
        </div>
      </div>
      
      {/* Due Date */}
      <div className="mt-2 text-xs text-gray-500">
        📅 Due: {goal.dueDate}
      </div>
    </div>
  );
}
