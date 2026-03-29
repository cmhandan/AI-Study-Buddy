import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  BookOpen, Brain, MessageSquare, CheckCircle, ArrowRight, 
  Sparkles, Shield, Zap, Sun, Moon, Users, FileText, TrendingUp, Star,
  ChevronRight, Clock, Award, Lock, Bot, Sparkle
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import Logo from '../logo.png';

const LandingPage: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const features = [
    {
      icon: BookOpen,
      title: 'Smart Summarization',
      description: 'Upload any document and get AI-generated summaries that capture key concepts and main ideas instantly.',
      color: 'blue',
      gradient: 'from-blue-500 to-cyan-500',
    },
    {
      icon: Brain,
      title: 'AI-Generated Quizzes',
      description: 'Test your knowledge with automatically generated quizzes tailored to your study materials.',
      color: 'purple',
      gradient: 'from-purple-500 to-pink-500',
    },
    {
      icon: MessageSquare,
      title: 'Interactive Chat',
      description: 'Ask questions about your documents and get instant, accurate answers powered by RAG AI.',
      color: 'green',
      gradient: 'from-emerald-500 to-teal-500',
    },
    {
      icon: Zap,
      title: 'Instant Processing',
      description: 'Get your summaries, quizzes, and answers in seconds. No waiting, just learning.',
      color: 'amber',
      gradient: 'from-amber-500 to-orange-500',
    },
    {
      icon: Shield,
      title: 'Secure Storage',
      description: 'Your documents are encrypted and stored securely. Only you have access.',
      color: 'indigo',
      gradient: 'from-indigo-500 to-violet-500',
    },
    {
      icon: TrendingUp,
      title: 'Progress Tracking',
      description: 'Monitor your quiz scores, study time, and learning progress with detailed analytics.',
      color: 'rose',
      gradient: 'from-rose-500 to-red-500',
    },
  ];

  const stats = [
    { icon: Users, value: '10,000+', label: 'Active Students', color: 'text-blue-600 dark:text-blue-400' },
    { icon: FileText, value: '50,000+', label: 'Documents Processed', color: 'text-purple-600 dark:text-purple-400' },
    { icon: Star, value: '98%', label: 'Satisfaction Rate', color: 'text-amber-500' },
    { icon: Bot, value: '24/7', label: 'AI Availability', color: 'text-emerald-600 dark:text-emerald-400' },
  ];

  const steps = [
    {
      number: '01',
      title: 'Upload Your Material',
      description: 'Simply drag and drop your PDF, DOCX, or TXT files. We support all major document formats.',
      icon: FileText,
    },
    {
      number: '02',
      title: 'AI Analysis',
      description: 'Our AI instantly analyzes your content, identifying key concepts, important terms, and main topics.',
      icon: Brain,
    },
    {
      number: '03',
      title: 'Learn & Practice',
      description: 'Generate summaries, take quizzes, and chat with your documents to master any subject.',
      icon: Award,
    },
  ];

  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'Medical Student, Year 3',
      content: 'StudyBuddy has transformed how I prepare for exams. The AI summaries save me hours every week.',
      rating: 5,
      avatar: 'SJ',
    },
    {
      name: 'Michael Chen',
      role: 'Computer Science Major',
      content: 'The interactive chat feature is incredible. I can ask follow-up questions just like talking to a tutor.',
      rating: 5,
      avatar: 'MC',
    },
    {
      name: 'Emily Rodriguez',
      role: 'Law Student',
      content: 'Quiz generation helps me test my understanding of case law. My grades have improved significantly!',
      rating: 5,
      avatar: 'ER',
    },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900 overflow-x-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-2 group">
              <img src={Logo} alt="StudyBuddy Logo" className="h-10 w-auto object-contain" />
              <span className="text-xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
                StudyBuddy
              </span>
            </Link>
            <div className="flex items-center gap-3">
              <button
                onClick={toggleTheme}
                className="p-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all"
                title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              >
                {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
              <Link
                to="/login"
                className="hidden sm:block px-4 py-2 text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-xl transition-all shadow-lg shadow-blue-600/25 hover:shadow-xl hover:shadow-blue-600/30"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-28 pb-20 lg:pt-32 lg:pb-28 px-4 relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-20 left-0 sm:left-10 w-72 sm:w-96 h-72 sm:h-96 bg-gradient-to-r from-blue-500/30 to-cyan-500/30 rounded-full blur-[100px] sm:blur-[120px] animate-pulse"></div>
          <div className="absolute bottom-20 right-0 sm:right-10 w-72 sm:w-96 h-72 sm:h-96 bg-gradient-to-r from-purple-500/30 to-pink-500/30 rounded-full blur-[100px] sm:blur-[120px] animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-indigo-500/10 to-purple-500/10 rounded-full blur-[120px]"></div>
          
          {/* Floating Elements */}
          <div className="hidden lg:block absolute top-32 right-20 animate-float">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-400 to-cyan-400 rounded-2xl rotate-12 opacity-20"></div>
          </div>
          <div className="hidden lg:block absolute bottom-40 left-20 animate-float-delayed">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-pink-400 rounded-xl -rotate-12 opacity-20"></div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto">
          <div className={`text-center max-w-4xl mx-auto transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 border border-blue-200/50 dark:border-blue-800/50 rounded-full px-5 py-2 mb-8">
              <Sparkle className="w-4 h-4 text-blue-600 dark:text-blue-400 animate-pulse" />
              <span className="text-sm font-semibold text-blue-700 dark:text-blue-300">Powered by Advanced AI</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold text-slate-900 dark:text-white mb-6 leading-tight">
              Your Personal
              <span className="block bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                AI Study Buddy
              </span>
            </h1>

            {/* Subheadline */}
            <p className="text-lg sm:text-xl lg:text-2xl text-slate-600 dark:text-slate-300 mb-10 max-w-2xl mx-auto leading-relaxed">
              Transform any document into interactive learning experiences. 
              <span className="hidden sm:inline"> Get instant summaries, generate quizzes, and chat with your materials.</span>
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
              <Link
                to="/register"
                className="w-full sm:w-auto group px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-lg font-bold rounded-2xl transition-all shadow-xl shadow-blue-600/30 hover:shadow-2xl hover:shadow-blue-600/40 flex items-center justify-center gap-2"
              >
                Start Learning Free
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-slate-500 dark:text-slate-400">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-emerald-500" />
                <span>Free to start</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-emerald-500" />
                <span>No credit card required</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-emerald-500" />
                <span>Setup in 30 seconds</span>
              </div>
            </div>
          </div>

          {/* Hero Visual - App Preview */}
          <div className={`mt-12 lg:mt-16 relative transition-all duration-1000 delay-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <div className="absolute inset-0 bg-gradient-to-t from-white dark:from-slate-900 via-transparent to-transparent z-10 pointer-events-none" />
            
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl shadow-2xl border border-slate-700/50 p-3 max-w-5xl mx-auto overflow-hidden">
              {/* Browser Header */}
              <div className="flex items-center justify-between px-4 py-3 bg-slate-800/50 rounded-t-xl border-b border-slate-700/50">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                  <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                </div>
                <div className="hidden sm:flex items-center gap-2 bg-slate-700/50 rounded-lg px-4 py-1.5">
                  <Lock className="w-3 h-3 text-slate-400" />
                  <span className="text-xs text-slate-400">studdybuddy.com</span>
                </div>
                <div className="w-16"></div>
              </div>

              {/* App Content Preview */}
              <div className="bg-slate-900 rounded-b-2xl p-6 lg:p-8">
                <div className="grid lg:grid-cols-3 gap-4">
                  {/* Document Upload */}
                  <div className="bg-slate-800/80 rounded-xl p-4 border border-slate-700/50">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                        <FileText className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="text-white font-semibold text-sm">Biology Notes.pdf</p>
                        <p className="text-slate-400 text-xs">Uploaded 2 hours ago</p>
                      </div>
                    </div>
                    <div className="h-20 bg-slate-700/50 rounded-lg flex items-center justify-center">
                      <Sparkles className="w-6 h-6 text-blue-400 animate-pulse" />
                    </div>
                  </div>

                  {/* Summary */}
                  <div className="bg-gradient-to-br from-purple-900/50 to-indigo-900/50 rounded-xl p-4 border border-purple-700/30">
                    <div className="flex items-center gap-2 mb-3">
                      <Brain className="w-5 h-5 text-purple-400" />
                      <span className="text-purple-300 font-semibold text-sm">AI Summary</span>
                    </div>
                    <div className="space-y-2">
                      <div className="h-2 bg-purple-500/30 rounded w-full"></div>
                      <div className="h-2 bg-purple-500/30 rounded w-5/6"></div>
                      <div className="h-2 bg-purple-500/30 rounded w-4/5"></div>
                      <div className="h-2 bg-purple-500/30 rounded w-full"></div>
                    </div>
                  </div>

                  {/* Quiz Stats */}
                  <div className="bg-gradient-to-br from-emerald-900/50 to-teal-900/50 rounded-xl p-4 border border-emerald-700/30">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-emerald-300 font-semibold text-sm">Quiz Score</span>
                      <span className="text-emerald-400 font-bold text-lg">85%</span>
                    </div>
                    <div className="h-2 bg-emerald-500/30 rounded-full overflow-hidden">
                      <div className="h-full w-[85%] bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full"></div>
                    </div>
                    <div className="flex justify-between mt-3 text-xs text-emerald-300/70">
                      <span>8/10 correct</span>
                      <span>Top 15%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating Cards */}
            <div className="hidden lg:block absolute -right-4 top-1/4 animate-float">
              <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl p-4 border border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/50 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-white text-sm">Progress Saved!</p>
                    <p className="text-xs text-slate-500">Quiz completed</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="hidden lg:block absolute -left-4 top-1/3 animate-float-delayed">
              <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl p-4 border border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center">
                    <Bot className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-white text-sm">AI is thinking...</p>
                    <p className="text-xs text-slate-500">Analyzing document</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 lg:py-20 bg-gradient-to-b from-slate-50 to-white dark:from-slate-800/50 dark:to-slate-900">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {stats.map((stat, idx) => (
              <div 
                key={idx}
                className="group text-center p-6 bg-white dark:bg-slate-800/50 rounded-2xl border border-slate-200/50 dark:border-slate-700/50 hover:border-blue-300 dark:hover:border-blue-600 hover:shadow-lg hover:shadow-blue-600/10 transition-all duration-300"
              >
                <div className={`inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-700/50 mb-4 group-hover:scale-110 transition-transform ${stat.color}`}>
                  <stat.icon className="w-7 h-7" />
                </div>
                <div className="text-3xl lg:text-4xl font-bold text-slate-900 dark:text-white mb-2">{stat.value}</div>
                <div className="text-sm text-slate-600 dark:text-slate-400">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 lg:py-28 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-1.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm font-semibold rounded-full mb-4">
              How It Works
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 dark:text-white mb-4">
              Start Learning in Minutes
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              Three simple steps to transform your study materials into interactive learning experiences
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
            {steps.map((step, idx) => (
              <div key={idx} className="relative group">
                {/* Connector Line */}
                {idx < steps.length - 1 && (
                  <div className="hidden md:block absolute top-16 left-full w-full h-0.5 bg-gradient-to-r from-blue-500/50 to-purple-500/50 -translate-x-1/2 z-0"></div>
                )}
                
                <div className="relative z-10 bg-white dark:bg-slate-800 rounded-2xl p-8 border border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-600 hover:shadow-xl hover:shadow-blue-600/10 transition-all duration-300">
                  <div className="flex items-center justify-between mb-6">
                    <span className="text-5xl font-bold bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent opacity-50">
                      {step.number}
                    </span>
                    <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                      <step.icon className="w-7 h-7 text-white" />
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">{step.title}</h3>
                  <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 lg:py-28 bg-gradient-to-b from-slate-50/50 to-white dark:from-slate-800/50 dark:to-slate-900 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-1.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-sm font-semibold rounded-full mb-4">
              Powerful Features
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 dark:text-white mb-4">
              Everything You Need to Excel
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              Powerful AI tools designed to accelerate your learning and boost retention
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {features.map((feature, idx) => (
              <div 
                key={idx}
                className="group relative bg-white dark:bg-slate-800 rounded-2xl p-6 lg:p-8 border border-slate-200 dark:border-slate-700 hover:border-transparent transition-all duration-300 hover:shadow-2xl overflow-hidden"
              >
                {/* Gradient Background on Hover */}
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
                
                <div className="relative z-10">
                  <div className={`w-14 h-14 bg-gradient-to-br ${feature.gradient} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg`}>
                    <feature.icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:bg-clip-text group-hover:${feature.gradient}">
                    {feature.title}
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{feature.description}</p>
                </div>

                {/* Learn More Link */}
                <div className="relative z-10 mt-6 flex items-center gap-1 text-sm font-semibold text-blue-600 dark:text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity">
                  Learn more <ChevronRight className="w-4 h-4" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 lg:py-28 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-1.5 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 text-sm font-semibold rounded-full mb-4">
              Testimonials
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 dark:text-white mb-4">
              Loved by Students Everywhere
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              See what students are saying about their learning experience
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, idx) => (
              <div 
                key={idx}
                className="bg-white dark:bg-slate-800 rounded-2xl p-8 border border-slate-200 dark:border-slate-700 hover:shadow-xl transition-all duration-300"
              >
                {/* Stars */}
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-amber-400 fill-amber-400" />
                  ))}
                </div>
                
                <p className="text-slate-700 dark:text-slate-300 mb-6 leading-relaxed">
                  "{testimonial.content}"
                </p>
                
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-white">{testimonial.name}</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 lg:py-28 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="relative bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 rounded-3xl p-10 lg:p-16 text-center overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 left-0 w-40 h-40 bg-white rounded-full -translate-x-1/2 -translate-y-1/2"></div>
              <div className="absolute bottom-0 right-0 w-60 h-60 bg-white rounded-full translate-x-1/3 translate-y-1/3"></div>
              <div className="absolute top-1/2 right-0 w-32 h-32 bg-white rounded-full translate-x-1/2"></div>
            </div>

            <div className="relative">
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span className="text-sm font-semibold text-white/90">Join thousands of students</span>
              </div>

              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6">
                Ready to Transform Your Learning?
              </h2>
              <p className="text-lg lg:text-xl text-blue-100 mb-10 max-w-2xl mx-auto leading-relaxed">
                Stop spending hours trying to understand complex topics. Let AI do the heavy lifting while you focus on what matters most.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  to="/register"
                  className="w-full sm:w-auto group px-8 py-4 bg-white text-blue-600 text-lg font-bold rounded-2xl transition-all shadow-xl hover:shadow-2xl hover:scale-105 flex items-center justify-center gap-2"
                >
                  Get Started for Free
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <div className="flex items-center gap-2 text-blue-100">
                  <Clock className="w-5 h-5" />
                  <span className="text-sm">Setup in 30 seconds</span>
                </div>
              </div>

              {/* Features List */}
              <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
                {[
                  'Unlimited document uploads',
                  'AI-powered summaries & quizzes',
                  'Track your learning progress',
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-xl px-4 py-3">
                    <CheckCircle className="w-5 h-5 text-emerald-300 flex-shrink-0" />
                    <span className="text-white text-sm font-medium">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 dark:bg-slate-950 border-t border-slate-800 py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            {/* Brand */}
            <div className="md:col-span-2">
              <Link to="/" className="flex items-center gap-2 mb-4">
              <img src={Logo} alt="StudyBuddy Logo" className="h-10 w-auto object-contain" />
                <span className="text-xl font-bold text-white">StudyBuddy</span>
              </Link>
              <p className="text-slate-400 max-w-md leading-relaxed">
                Transform any document into interactive learning experiences. Our AI-powered platform helps you understand faster and remember longer.
              </p>
            </div>

            {/* Links */}
            <div>
              <h4 className="text-white font-semibold mb-4">Product</h4>
              <div className="space-y-3">
                <Link to="/register" className="block text-slate-400 hover:text-white transition-colors">Features</Link>
                <Link to="/register" className="block text-slate-400 hover:text-white transition-colors">Pricing</Link>
                <Link to="/register" className="block text-slate-400 hover:text-white transition-colors">Testimonials</Link>
              </div>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4">Account</h4>
              <div className="space-y-3">
                <Link to="/login" className="block text-slate-400 hover:text-white transition-colors">Sign In</Link>
                <Link to="/register" className="block text-slate-400 hover:text-white transition-colors">Register</Link>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-slate-500">
              © 2024 StudyBuddy. All rights reserved.
            </p>
            <div className="flex items-center gap-6 text-sm text-slate-500">
              <Link to="#" className="hover:text-white transition-colors">Privacy Policy</Link>
              <Link to="#" className="hover:text-white transition-colors">Terms of Service</Link>
            </div>
          </div>
        </div>
      </footer>

      {/* CSS for animations */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(5deg); }
        }
        @keyframes float-delayed {
          0%, 100% { transform: translateY(0) rotate(-12deg); }
          50% { transform: translateY(-15px) rotate(-8deg); }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        .animate-float-delayed {
          animation: float-delayed 7s ease-in-out infinite;
          animation-delay: 1s;
        }
        .delay-1000 {
          animation-delay: 1000ms;
        }
      `}</style>
    </div>
  );
};

export default LandingPage;
