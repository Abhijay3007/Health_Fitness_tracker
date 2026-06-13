'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Activity,
  Dumbbell,
  Apple,
  CheckSquare,
  Target,
  Scale,
  TrendingUp,
  Award,
  ChevronRight,
  ArrowRight
} from 'lucide-react';

export default function LandingPage() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 100 } },
  };

  const features = [
    {
      title: 'Workout Tracker',
      description: 'Log weights, reps, sets, and rest times. Explore a built-in exercise database or add custom movements.',
      icon: Dumbbell,
      color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
    },
    {
      title: 'Macro & Nutrition Logs',
      description: 'Track daily calorie intake, proteins, carbs, and fat breakdown. Log custom foods and log meals.',
      icon: Apple,
      color: 'text-indigo-500 bg-indigo-500/10 border-indigo-500/20',
    },
    {
      title: 'Habit Builder',
      description: 'Keep streaks alive, log completions, and track your weekly and monthly consistency on a progress grid.',
      icon: CheckSquare,
      color: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
    },
    {
      title: 'Body Metrics & BMI',
      description: 'Log weight, body fat percentage, and measurements (waist, hip, chest). Auto-calculate your BMI.',
      icon: Scale,
      color: 'text-cyan-500 bg-cyan-500/10 border-cyan-500/20',
    },
    {
      title: 'Fitness Goal Setting',
      description: 'Define milestones like target weights or training consistency. Watch your progress update in real-time.',
      icon: Target,
      color: 'text-rose-500 bg-rose-500/10 border-rose-500/20',
    },
    {
      title: 'Analytics & Insights',
      description: 'Generate recommendations based on macro distribution, calorie balances, and workout frequency trends.',
      icon: TrendingUp,
      color: 'text-teal-500 bg-teal-500/10 border-teal-500/20',
    },
  ];

  return (
    <div className="flex-1 flex flex-col relative overflow-hidden bg-background text-foreground">
      {/* Background blobs */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-primary/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full bg-secondary/10 blur-[150px] pointer-events-none" />

      {/* Top Navbar */}
      <header className="w-full max-w-7xl mx-auto px-6 py-6 flex items-center justify-between z-10">
        <div className="flex items-center space-x-2">
          <Activity className="h-8 w-8 text-primary glow-primary animate-pulse" />
          <span className="text-2xl font-black tracking-tight bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            AuraFit
          </span>
        </div>
        <div className="flex items-center space-x-4">
          <Link href="/login" className="text-sm font-medium hover:text-primary transition-colors px-4 py-2 rounded-md hover:bg-muted">
            Sign In
          </Link>
          <Link href="/register" className="text-sm font-semibold text-white bg-primary hover:bg-primary/90 transition-all px-4 py-2 rounded-lg shadow-lg shadow-primary/20">
            Get Started
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 max-w-7xl mx-auto px-6 flex flex-col justify-center py-12 lg:py-24 z-10">
        <motion.div
          className="text-center max-w-3xl mx-auto space-y-6 mb-16"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full border border-border bg-card/50 text-xs font-semibold tracking-wide text-primary">
            <Award className="h-4 w-4" />
            <span>GAMIFIED FITNESS MILESTONES & STREAKS</span>
          </div>
          <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-[1.15]">
            Elevate Your Body,{' '}
            <span className="bg-gradient-to-r from-primary via-emerald-400 to-secondary bg-clip-text text-transparent">
              Track Your Progress
            </span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Log workouts, track calories, monitor body measurements, and build habits. AuraFit is the premium tool for your fitness journey.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              href="/register"
              className="w-full sm:w-auto flex items-center justify-center space-x-2 px-8 py-4 rounded-xl text-white font-bold bg-gradient-to-r from-primary to-secondary hover:brightness-110 transition-all shadow-xl shadow-primary/20 group cursor-pointer"
            >
              <span>Create Free Account</span>
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              href="/login"
              className="w-full sm:w-auto flex items-center justify-center space-x-2 px-8 py-4 rounded-xl border border-border hover:bg-card/80 transition-colors font-bold cursor-pointer"
            >
              <span>Explore Dashboard</span>
              <ChevronRight className="h-5 w-5" />
            </Link>
          </div>
        </motion.div>

        {/* Feature Cards Grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
        >
          {features.map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={idx}
                className="group flex flex-col p-6 rounded-2xl border border-border bg-card/60 backdrop-blur-sm shadow-lg hover:shadow-xl hover:border-primary/20 hover:-translate-y-1 transition-all duration-300"
                variants={itemVariants}
              >
                <div className={`p-3 rounded-xl border w-fit mb-5 ${feature.color}`}>
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            );
          })}
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-border mt-16 bg-card/20 backdrop-blur-sm z-10">
        <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between text-muted-foreground text-sm">
          <p>© {new Date().getFullYear()} AuraFit. All rights reserved.</p>
          <div className="flex space-x-6 mt-4 sm:mt-0">
            <a href="#" className="hover:text-primary transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-primary transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-primary transition-colors">API Docs</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
