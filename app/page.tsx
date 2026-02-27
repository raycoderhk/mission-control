"use client";

import eventsData from "../data/events.json";
import friendsData from "../data/friends.json";
import tasksData from "../data/tasks.json";
import goalsData from "../data/goals.json";

export default function Home() {
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

        {/* Quick Stats */}
        <DashboardCard title="📊 Quick Stats" color="yellow">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatBox label="Events This Month" value={eventsData.upcoming.length} color="blue" />
            <StatBox label="Pending Tasks" value={pendingTasks.length} color="green" />
            <StatBox label="Friends Tracked" value={friends.length} color="purple" />
            <StatBox label="Goals Active" value={monthlyGoals.length + quarterlyGoals.length + yearlyGoals.length} color="red" />
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
}: {
  label: string;
  value: number;
  color: string;
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
      <div className="text-2xl font-bold">{value}</div>
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
