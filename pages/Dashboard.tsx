import React, { useEffect, useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { 
  Book, CheckCircle, Clock, TrendingUp, Loader, Target, Trophy, 
  Flame, Star, TrendingDown, Lightbulb, ChevronRight,
  Brain, FileText, Sparkles
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { saveStudySession } from '../services/geminiService';

const Dashboard: React.FC = () => {
  const { documents, quizResults, dashboardStats, isLoading } = useApp();
  const { user, token } = useAuth();
  const [streak] = useState(0);
  const [xp, setXp] = useState(0);
  const [level, setLevel] = useState(1);

  useEffect(() => {
    const startTime = Date.now();
    
    return () => {
      if (token) {
        const durationMinutes = Math.round((Date.now() - startTime) / 60000);
        if (durationMinutes > 0) {
          saveStudySession(token, durationMinutes).catch(console.error);
        }
      }
    };
  }, [token]);

  const totalQuizzes = dashboardStats?.quizCount ?? quizResults.length;
  const avgScore = dashboardStats?.averageScore ?? 0;
  const studyHours = dashboardStats?.studyHours ?? 0;
  const docCount = dashboardStats?.documentCount ?? documents.length;

  useEffect(() => {
    const calculatedXp = (docCount * 50) + (totalQuizzes * 100) + Math.round(studyHours * 20) + (streak * 25);
    setXp(calculatedXp);
    setLevel(Math.floor(calculatedXp / 500) + 1);
  }, [docCount, totalQuizzes, studyHours, streak]);

  const chartData = dashboardStats?.recentQuizzes?.map((r, idx) => ({
    name: `Quiz ${idx + 1}`,
    score: (r.score / r.total_questions) * 100
  })) ?? [];

  const weakAreas = useMemo(() => {
    if (!quizResults.length) return [];
    return quizResults
      .filter(q => (q.score / q.totalQuestions) * 100 < 60)
      .map(q => ({
        title: q.docTitle || 'Unknown Topic',
        score: Math.round((q.score / q.totalQuestions) * 100)
      }))
      .slice(0, 3);
  }, [quizResults]);

  const achievements = useMemo(() => {
    const badges = [];
    
    if (docCount >= 1) badges.push({ icon: Book, name: 'First Upload', color: 'text-blue-500 bg-blue-100 dark:bg-blue-900/30' });
    if (totalQuizzes >= 1) badges.push({ icon: Brain, name: 'Quiz Starter', color: 'text-purple-500 bg-purple-100 dark:bg-purple-900/30' });
    if (totalQuizzes >= 10) badges.push({ icon: Trophy, name: 'Quiz Master', color: 'text-amber-500 bg-amber-100 dark:bg-amber-900/30' });
    if (avgScore >= 90) badges.push({ icon: Star, name: 'High Scorer', color: 'text-yellow-500 bg-yellow-100 dark:bg-yellow-900/30' });
    if (studyHours >= 5) badges.push({ icon: Clock, name: 'Dedicated Learner', color: 'text-emerald-500 bg-emerald-100 dark:bg-emerald-900/30' });
    if (streak >= 3) badges.push({ icon: Flame, name: 'On Fire', color: 'text-orange-500 bg-orange-100 dark:bg-orange-900/30' });
    
    return badges.slice(0, 4);
  }, [docCount, totalQuizzes, avgScore, studyHours, streak]);

  const dailyGoals = useMemo(() => {
    const today = new Date().toDateString();
    const docsToday = documents.filter(d => new Date(d.uploadDate).toDateString() === today).length;
    const quizzesThisWeek = quizResults.filter(q => {
      const quizDate = new Date(q.date);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return quizDate >= weekAgo;
    }).length;

    return [
      { label: 'Documents Today', current: docsToday, target: 2, icon: FileText },
      { label: 'Quizzes This Week', current: quizzesThisWeek, target: 5, icon: Brain },
      { label: 'Study Hours', current: studyHours, target: 5, icon: Clock },
    ];
  }, [documents, quizResults, studyHours]);

  const streakCalendar = useMemo(() => {
    const days = [];
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toDateString();
      const hasActivity = quizResults.some(q => new Date(q.date).toDateString() === dateStr) ||
                         documents.some(d => new Date(d.uploadDate).toDateString() === dateStr);
      days.push({
        date: date.toLocaleDateString('en-US', { weekday: 'short' }),
        day: date.getDate(),
        active: hasActivity || i === 0,
        isToday: i === 0
      });
    }
    return days;
  }, [quizResults, documents]);

  const tipOfTheDay = useMemo(() => {
    const tips = [
      "Review your notes within 24 hours to improve retention by up to 80%.",
      "Take short breaks every 25-30 minutes to maintain focus and prevent burnout.",
      "Self-testing is more effective than passive re-reading.",
      "Teach concepts to others to deepen your understanding.",
      "Use spaced repetition - review material at increasing intervals.",
      "Create visual mind maps to connect related concepts.",
      "Sleep 7-9 hours to consolidate memories and learning.",
      "Stay hydrated - even mild dehydration can impair cognitive function.",
      "Exercise regularly to boost brain function and memory.",
      "Break complex topics into smaller, manageable chunks."
    ];
    return tips[new Date().getDay() % tips.length];
  }, []);

  const mostStudiedTopic = useMemo(() => {
    const topicCounts: Record<string, number> = {};
    documents.forEach(doc => {
      const topic = doc.title?.split(' ').slice(0, 2).join(' ') || 'General';
      topicCounts[topic] = (topicCounts[topic] || 0) + 1;
    });
    const sorted = Object.entries(topicCounts).sort(([, a], [, b]) => b - a);
    return sorted.length > 0 ? sorted[0][0] : null;
  }, [documents]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header with XP & Level */}
      <header className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-1">
            Welcome back, {user?.name || 'Student'} 👋
          </h2>
          <p className="text-slate-500 dark:text-slate-400">Track your progress and continue learning.</p>
        </div>
        
        {/* XP & Level Badge */}
        <div className="flex items-center gap-4">
          <div className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white px-5 py-3 rounded-xl shadow-lg">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                  <Star className="w-6 h-6" />
                </div>
                <span className="absolute -bottom-1 -right-1 bg-amber-400 text-amber-900 text-xs font-bold px-1.5 py-0.5 rounded-full">
                  {level}
                </span>
              </div>
              <div>
                <p className="text-xs opacity-80">Level {level}</p>
                <p className="text-lg font-bold">{xp.toLocaleString()} XP</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Documents" value={docCount} icon={Book} color="bg-blue-500 text-blue-500" />
        <StatCard title="Quizzes Taken" value={totalQuizzes} icon={CheckCircle} color="bg-emerald-500 text-emerald-500" />
        <StatCard title="Average Score" value={`${avgScore}%`} icon={TrendingUp} color="bg-purple-500 text-purple-500" />
        <StatCard title="Study Hours" value={studyHours} icon={Clock} color="bg-amber-500 text-amber-500" />
      </div>

      {/* Streak & Goals Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Progress Streak Calendar */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Flame className="w-5 h-5 text-orange-500" />
              Study Streak
            </h3>
            <span className="text-2xl font-bold text-orange-500">{streak} days 🔥</span>
          </div>
          <div className="flex justify-between">
            {streakCalendar.map((day, idx) => (
              <div key={idx} className="flex flex-col items-center gap-2">
                <span className="text-xs text-slate-500 dark:text-slate-400">{day.date}</span>
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-sm font-semibold transition-all ${
                  day.isToday 
                    ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30' 
                    : day.active 
                      ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400' 
                      : 'bg-slate-100 dark:bg-slate-700 text-slate-400'
                }`}>
                  {day.day}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Daily/Weekly Goals */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 lg:col-span-2">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <Target className="w-5 h-5 text-blue-500" />
            Daily Goals
          </h3>
          <div className="space-y-4">
            {dailyGoals.map((goal, idx) => {
              const progress = Math.min((goal.current / goal.target) * 100, 100);
              return (
                <div key={idx} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <goal.icon className="w-4 h-4 text-slate-500" />
                      <span className="text-slate-700 dark:text-slate-300">{goal.label}</span>
                    </div>
                    <span className="text-slate-600 dark:text-slate-400">
                      {goal.current}/{goal.target}
                    </span>
                  </div>
                  <div className="h-2.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${
                        progress >= 100 
                          ? 'bg-emerald-500' 
                          : progress >= 50 
                            ? 'bg-blue-500' 
                            : 'bg-slate-300 dark:bg-slate-600'
                      }`}
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Learning Insights */}
        <div className="space-y-6">
          {/* Most Studied Topic */}
          {mostStudiedTopic && (
            <div className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white p-6 rounded-xl shadow-lg">
              <div className="flex items-center gap-2 mb-2">
                <Book className="w-5 h-5 opacity-80" />
                <span className="text-sm font-medium opacity-80">Most Studied</span>
              </div>
              <p className="text-xl font-bold mb-3">{mostStudiedTopic}</p>
              <div className="flex items-center gap-2 text-sm opacity-80">
                <TrendingUp className="w-4 h-4" />
                <span>Your top focus area</span>
              </div>
            </div>
          )}

          {/* Weak Areas */}
          <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <TrendingDown className="w-5 h-5 text-amber-500" />
              Areas to Improve
            </h3>
            {weakAreas.length > 0 ? (
              <div className="space-y-3">
                {weakAreas.map((area, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                    <span className="text-sm text-slate-700 dark:text-slate-300 truncate mr-2">{area.title}</span>
                    <span className="text-sm font-semibold text-amber-500">{area.score}%</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500 dark:text-slate-400">No weak areas yet. Keep taking quizzes!</p>
            )}
          </div>

          {/* Top Achievements */}
          <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-500" />
              Top Achievements
            </h3>
            {achievements.length > 0 ? (
              <div className="grid grid-cols-2 gap-3">
                {achievements.map((badge, idx) => (
                  <div key={idx} className={`flex items-center gap-2 p-3 rounded-lg ${badge.color}`}>
                    <badge.icon className="w-5 h-5" />
                    <span className="text-xs font-semibold">{badge.name}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500 dark:text-slate-400">Start learning to earn badges!</p>
            )}
          </div>
        </div>

        {/* Progress Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-500" />
            Recent Quiz Performance
          </h3>
          <div className="h-64">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} domain={[0, 100]} ticks={[0, 20, 40, 60, 80, 100]} />
                  <Tooltip
                    cursor={{ fill: 'transparent' }}
                    contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#fff' }}
                    formatter={(value: number) => [`${Math.round(value)}%`, 'Score']}
                    labelFormatter={(label) => `${label}`}
                  />
                  <Bar dataKey="score" radius={[4, 4, 0, 0]}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.score >= 70 ? '#10b981' : entry.score >= 40 ? '#f59e0b' : '#ef4444'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <Brain className="w-12 h-12 text-slate-300 dark:text-slate-600 mb-3" />
                <p className="text-slate-500 dark:text-slate-400 mb-2">No quiz data yet</p>
                <Link to="/documents" className="text-blue-500 hover:text-blue-600 font-medium text-sm">
                  Take your first quiz →
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Section: Recent Documents & Tips */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Documents */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-500" />
              Recent Documents
            </h3>
            <Link to="/documents" className="text-sm text-blue-500 hover:text-blue-600 font-medium flex items-center gap-1">
              View all <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="space-y-3">
            {dashboardStats?.recentDocuments?.slice(0, 4).map((doc: any) => (
              <Link key={doc.id} to={`/document/${doc.id}`} className="flex items-center gap-4 p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-lg">
                  <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-medium text-slate-900 dark:text-white truncate">{doc.title}</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Added {new Date(doc.created_at).toLocaleDateString()}
                  </p>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-400" />
              </Link>
            ))}
            {(!dashboardStats?.recentDocuments || dashboardStats.recentDocuments.length === 0) && (
              <div className="text-center py-8">
                <FileText className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                <p className="text-slate-500 dark:text-slate-400 mb-3">No documents yet</p>
                <Link to="/upload" className="text-blue-500 hover:text-blue-600 font-medium text-sm">
                  Upload your first document →
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Tip of the Day */}
        <div className="bg-gradient-to-br from-purple-500 via-indigo-500 to-blue-600 p-6 rounded-xl text-white shadow-lg">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-5 h-5" />
            <span className="text-sm font-semibold opacity-90">Tip of the Day</span>
          </div>
          <p className="text-lg font-medium mb-4 leading-relaxed">
            "{tipOfTheDay}"
          </p>
          <div className="flex items-center gap-2 text-sm opacity-80">
            <Lightbulb className="w-4 h-4" />
            <span>Apply this to your study routine</span>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link to="/upload" className="group bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-600 hover:shadow-lg transition-all">
          <div className="flex items-center gap-4">
            <div className="bg-blue-100 dark:bg-blue-900/30 p-4 rounded-xl group-hover:scale-110 transition-transform">
              <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h4 className="text-lg font-bold text-slate-900 dark:text-white">Upload Document</h4>
              <p className="text-sm text-slate-500 dark:text-slate-400">Add new study material</p>
            </div>
          </div>
        </Link>
        <Link to="/documents" className="group bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-emerald-300 dark:hover:border-emerald-600 hover:shadow-lg transition-all">
          <div className="flex items-center gap-4">
            <div className="bg-emerald-100 dark:bg-emerald-900/30 p-4 rounded-xl group-hover:scale-110 transition-transform">
              <Brain className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <h4 className="text-lg font-bold text-slate-900 dark:text-white">Take a Quiz</h4>
              <p className="text-sm text-slate-500 dark:text-slate-400">Test your knowledge</p>
            </div>
          </div>
        </Link>
        <Link to="/documents" className="group bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-purple-300 dark:hover:border-purple-600 hover:shadow-lg transition-all">
          <div className="flex items-center gap-4">
            <div className="bg-purple-100 dark:bg-purple-900/30 p-4 rounded-xl group-hover:scale-110 transition-transform">
              <Book className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <h4 className="text-lg font-bold text-slate-900 dark:text-white">Review Notes</h4>
              <p className="text-sm text-slate-500 dark:text-slate-400">Revisit summaries</p>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, icon: Icon, color }: { title: string; value: string | number; icon: React.ElementType; color: string }) => (
  <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-1">{title}</p>
        <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{value}</h3>
      </div>
      <div className={`p-3 rounded-xl ${color} bg-opacity-10`}>
        <Icon className={`w-6 h-6 ${color}`} />
      </div>
    </div>
  </div>
);

export default Dashboard;
