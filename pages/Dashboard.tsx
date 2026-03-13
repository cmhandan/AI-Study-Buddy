import React from 'react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Book, CheckCircle, Clock, TrendingUp } from 'lucide-react';

const Dashboard: React.FC = () => {
  const { documents, quizResults } = useApp();
  const { user } = useAuth();

  const totalQuizzes = quizResults.length;
  const avgScore = totalQuizzes > 0
    ? Math.round(quizResults.reduce((acc, curr) => acc + (curr.score / curr.totalQuestions) * 100, 0) / totalQuizzes)
    : 0;

  // Prepare chart data (last 5 quiz attempts)
  const chartData = quizResults.slice(-5).map((r, idx) => ({
    name: `Quiz ${idx + 1}`,
    score: (r.score / r.totalQuestions) * 100
  }));

  const StatCard = ({ title, value, icon: Icon, color }: any) => (
    <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-slate-400 text-sm font-medium mb-1">{title}</p>
          <h3 className="text-3xl font-bold text-white">{value}</h3>
        </div>
        <div className={`p-3 rounded-full bg-opacity-20 ${color}`}>
          <Icon className={`w-6 h-6 ${color.replace('bg-', 'text-')}`} />
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      <header className="mb-8">
        <h2 className="text-3xl font-bold text-white mb-2">Welcome back, {user?.name || 'Student'}</h2>
        <p className="text-slate-400">Track your progress and continue learning.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Documents"
          value={documents.length}
          icon={Book}
          color="bg-blue-500 text-blue-500"
        />
        <StatCard
          title="Quizzes Taken"
          value={totalQuizzes}
          icon={CheckCircle}
          color="bg-emerald-500 text-emerald-500"
        />
        <StatCard
          title="Average Score"
          value={`${avgScore}%`}
          icon={TrendingUp}
          color="bg-purple-500 text-purple-500"
        />
        <StatCard
          title="Study Hours"
          value="12.5"
          icon={Clock}
          color="bg-amber-500 text-amber-500"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Progress Chart */}
        <div className="lg:col-span-2 bg-slate-800 p-6 rounded-xl border border-slate-700">
          <h3 className="text-lg font-bold text-white mb-6">Recent Quiz Performance</h3>
          <div className="h-64">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip
                    cursor={{ fill: 'transparent' }}
                    contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                  />
                  <Bar dataKey="score" radius={[4, 4, 0, 0]}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.score >= 70 ? '#10b981' : '#f59e0b'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-slate-500">
                No quiz data yet. Take a quiz to see your progress!
              </div>
            )}
          </div>
        </div>

        {/* Recent Documents */}
        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
          <h3 className="text-lg font-bold text-white mb-4">Recent Documents</h3>
          <div className="space-y-4">
            {documents.slice(0, 4).map(doc => (
              <div key={doc.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-slate-700 transition-colors cursor-pointer">
                <div className="bg-blue-500/20 p-2 rounded text-blue-400">
                  <Book className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-medium text-slate-200 line-clamp-1">{doc.title}</h4>
                  <p className="text-xs text-slate-500 mt-1">
                    Added {new Date(doc.uploadDate).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
            {documents.length === 0 && (
              <p className="text-slate-500 text-sm">No documents uploaded.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
