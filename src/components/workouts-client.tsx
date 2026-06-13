'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createExercise } from '@/app/actions/workout-actions';
import {
  Search,
  Dumbbell,
  BookOpen,
  History,
  Plus,
  X,
  PlayCircle,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  Award
} from 'lucide-react';

interface WorkoutsClientProps {
  exercises: any[];
  initialLogs: any[];
  isAdmin: boolean;
}

export default function WorkoutsClient({ exercises, initialLogs, isAdmin }: WorkoutsClientProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'library' | 'history'>('library');

  // Exercise Search & Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMuscle, setSelectedMuscle] = useState('All');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Admin New Exercise Modal states
  const [adminModal, setAdminModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newCategory, setNewCategory] = useState('Strength');
  const [newMuscle, setNewMuscle] = useState('Chest');
  const [newDifficulty, setNewDifficulty] = useState('Beginner');
  const [newInstructions, setNewInstructions] = useState('');
  const [newVideoUrl, setNewVideoUrl] = useState('');
  const [loading, setLoading] = useState(false);

  // Exercise detail modal
  const [selectedExercise, setSelectedExercise] = useState<any | null>(null);

  const muscleGroups = ['All', 'Chest', 'Back', 'Legs', 'Core', 'Arms', 'Shoulders'];
  const categories = ['All', 'Strength', 'Cardio', 'Flexibility'];

  // Filter exercises
  const filteredExercises = exercises.filter(ex => {
    const matchesSearch = ex.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          ex.instructions.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesMuscle = selectedMuscle === 'All' || ex.muscleGroup === selectedMuscle;
    const matchesCategory = selectedCategory === 'All' || ex.category === selectedCategory;
    return matchesSearch && matchesMuscle && matchesCategory;
  });

  const handleCreateExerciseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await createExercise({
      name: newName,
      category: newCategory,
      muscleGroup: newMuscle,
      difficulty: newDifficulty,
      instructions: newInstructions,
      videoUrl: newVideoUrl || undefined,
    });
    setLoading(false);
    if (res.success) {
      setAdminModal(false);
      // Reset form
      setNewName('');
      setNewInstructions('');
      setNewVideoUrl('');
      alert('Exercise created successfully!');
      router.refresh();
    } else {
      alert(res.error || 'Failed to create exercise');
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-6 rounded-2xl border border-border bg-card/60 backdrop-blur-md shadow-md">
        <div>
          <h1 className="text-3xl font-black tracking-tight leading-tight">Workouts Module</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Browse our library of movements or track and review your logged exercise sessions.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          {isAdmin && (
            <button
              onClick={() => setAdminModal(true)}
              className="flex items-center space-x-1 px-4 py-2.5 rounded-xl bg-destructive text-white font-bold hover:brightness-110 shadow-lg shadow-destructive/20 cursor-pointer text-sm"
            >
              <Plus className="h-4 w-4" />
              <span>Admin: Create Exercise</span>
            </button>
          )}
        </div>
      </div>

      {/* Tabs Menu */}
      <div className="flex border-b border-border/80 space-x-6 text-sm font-semibold">
        <button
          onClick={() => setActiveTab('library')}
          className={`pb-3 border-b-2 flex items-center space-x-2 transition-all cursor-pointer
            ${activeTab === 'library' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
        >
          <BookOpen className="h-4 w-4" />
          <span>Exercise Library ({filteredExercises.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`pb-3 border-b-2 flex items-center space-x-2 transition-all cursor-pointer
            ${activeTab === 'history' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
        >
          <History className="h-4 w-4" />
          <span>Workout History ({initialLogs.length})</span>
        </button>
      </div>

      {/* 1. LIBRARY TAB */}
      {activeTab === 'library' && (
        <div className="space-y-6">
          {/* Filters Panel */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 rounded-xl border border-border bg-card/40 backdrop-blur-sm">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search exercise or guidelines..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-border bg-background focus:outline-none focus:ring-1 focus:ring-primary focus:border-transparent text-sm"
              />
            </div>
            <div>
              <select
                value={selectedMuscle}
                onChange={e => setSelectedMuscle(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-1 focus:ring-primary"
              >
                {muscleGroups.map(m => (
                  <option key={m} value={m}>{m === 'All' ? 'All Muscle Groups' : m}</option>
                ))}
              </select>
            </div>
            <div>
              <select
                value={selectedCategory}
                onChange={e => setSelectedCategory(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-1 focus:ring-primary"
              >
                {categories.map(c => (
                  <option key={c} value={c}>{c === 'All' ? 'All Categories' : c}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Exercise Grid */}
          {filteredExercises.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 border border-dashed border-border rounded-2xl bg-card/10">
              <Dumbbell className="h-12 w-12 text-muted-foreground/60 mb-3 animate-pulse" />
              <p className="font-semibold text-muted-foreground">No exercises match your search filters.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredExercises.map(ex => (
                <div
                  key={ex.id}
                  onClick={() => setSelectedExercise(ex)}
                  className="flex flex-col justify-between p-5 rounded-2xl border border-border bg-card hover:border-primary/30 hover:-translate-y-1 shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-xs bg-muted font-bold uppercase tracking-wider text-muted-foreground px-2 py-0.5 rounded-md">
                        {ex.category}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border
                        ${ex.difficulty === 'Beginner' ? 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20' : 
                          ex.difficulty === 'Intermediate' ? 'text-indigo-500 bg-indigo-500/10 border-indigo-500/20' : 
                          'text-rose-500 bg-rose-500/10 border-rose-500/20'}`}
                      >
                        {ex.difficulty}
                      </span>
                    </div>
                    <h3 className="font-bold text-lg mb-1">{ex.name}</h3>
                    <p className="text-xs text-primary font-bold mb-3">{ex.muscleGroup}</p>
                    <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed">
                      {ex.instructions}
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-border/50 flex items-center justify-between text-xs font-semibold text-muted-foreground hover:text-primary transition-colors">
                    <span>View instructions</span>
                    <ChevronRight className="h-4 w-4" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 2. HISTORY TAB */}
      {activeTab === 'history' && (
        <div className="space-y-6">
          {initialLogs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 border border-dashed border-border rounded-2xl bg-card/10">
              <History className="h-12 w-12 text-muted-foreground/60 mb-3 animate-pulse" />
              <p className="font-semibold text-muted-foreground">You haven't logged any workouts yet.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {initialLogs.map(log => (
                <div key={log.id} className="p-6 rounded-2xl border border-border bg-card shadow-sm space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-border/50">
                    <div>
                      <h4 className="font-bold text-base flex items-center">
                        <Dumbbell className="h-4 w-4 mr-2 text-primary" />
                        <span>Workout Session</span>
                      </h4>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {new Date(log.date).toLocaleString('en-US', { dateStyle: 'long', timeStyle: 'short' })}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-4 text-xs font-semibold text-muted-foreground">
                      <span className="bg-muted px-2 py-1 rounded-md">{log.durationMinutes} mins</span>
                      <span className="bg-rose-500/10 text-rose-500 px-2 py-1 rounded-md">{log.caloriesBurned} kcal burned</span>
                    </div>
                  </div>

                  {/* Sets logged */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="border-b border-border/40 text-muted-foreground uppercase font-bold">
                          <th className="py-2">Exercise</th>
                          <th className="py-2 text-center">Set</th>
                          <th className="py-2 text-center">Reps</th>
                          <th className="py-2 text-center">Weight</th>
                        </tr>
                      </thead>
                      <tbody>
                        {log.sets.map((set: any) => (
                          <tr key={set.id} className="border-b border-border/20 hover:bg-muted/10">
                            <td className="py-2.5 font-bold">{set.exercise.name}</td>
                            <td className="py-2.5 text-center text-muted-foreground font-mono">{set.setNumber}</td>
                            <td className="py-2.5 text-center font-mono">{set.reps}</td>
                            <td className="py-2.5 text-center font-mono">{set.weight} kg</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {log.notes && (
                    <div className="p-3 bg-background/50 border border-border rounded-xl text-xs text-muted-foreground leading-relaxed">
                      <strong>Notes:</strong> {log.notes}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* EXERCISE DETAIL MODAL */}
      {selectedExercise && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-card border border-border rounded-2xl shadow-2xl p-6 relative">
            <button
              onClick={() => setSelectedExercise(null)}
              className="absolute top-4 right-4 p-1 rounded-md hover:bg-muted text-muted-foreground transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
            <div className="mb-4 pb-3 border-b border-border/60">
              <span className="text-xs bg-primary/10 text-primary font-bold px-2.5 py-1 rounded-md mb-2 inline-block">
                {selectedExercise.category}
              </span>
              <h3 className="text-2xl font-black">{selectedExercise.name}</h3>
              <p className="text-xs text-muted-foreground mt-1 font-semibold">Target Muscle: {selectedExercise.muscleGroup}</p>
            </div>
            <div className="space-y-4">
              <div className="space-y-1">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">Instructions</span>
                <p className="text-sm leading-relaxed text-muted-foreground">{selectedExercise.instructions}</p>
              </div>
              {selectedExercise.videoUrl && (
                <div className="pt-2">
                  <a
                    href={selectedExercise.videoUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center space-x-1.5 text-xs font-bold text-secondary hover:underline"
                  >
                    <PlayCircle className="h-4 w-4" />
                    <span>Watch Tutorial Video</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ADMIN CREATE EXERCISE MODAL */}
      {adminModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-card border border-border rounded-2xl shadow-2xl p-6 relative">
            <button
              onClick={() => setAdminModal(false)}
              className="absolute top-4 right-4 p-1 rounded-md hover:bg-muted text-muted-foreground transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
            <div className="mb-4">
              <h3 className="text-xl font-bold flex items-center space-x-2">
                <Dumbbell className="h-5 w-5 text-destructive" />
                <span>Admin: Create New Exercise</span>
              </h3>
              <p className="text-xs text-muted-foreground mt-1">Add to the global exercise database.</p>
            </div>

            <form onSubmit={handleCreateExerciseSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase text-muted-foreground">Exercise Name</label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  placeholder="e.g. Incline Bench Press"
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase text-muted-foreground">Category</label>
                  <select
                    value={newCategory}
                    onChange={e => setNewCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm"
                  >
                    <option value="Strength">Strength</option>
                    <option value="Cardio">Cardio</option>
                    <option value="Flexibility">Flexibility</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase text-muted-foreground">Muscle Group</label>
                  <select
                    value={newMuscle}
                    onChange={e => setNewMuscle(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm"
                  >
                    {muscleGroups.filter(m => m !== 'All').map(m => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold uppercase text-muted-foreground">Difficulty</label>
                <select
                  value={newDifficulty}
                  onChange={e => setNewDifficulty(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm"
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold uppercase text-muted-foreground">Instructions</label>
                <textarea
                  required
                  value={newInstructions}
                  onChange={e => setNewInstructions(e.target.value)}
                  placeholder="Provide step by step details..."
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm"
                  rows={3}
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold uppercase text-muted-foreground">Video Link (Optional)</label>
                <input
                  type="url"
                  value={newVideoUrl}
                  onChange={e => setNewVideoUrl(e.target.value)}
                  placeholder="https://youtube.com/..."
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-destructive text-white font-bold hover:brightness-115 disabled:opacity-50 transition-all cursor-pointer"
              >
                {loading ? 'Creating...' : 'Create Exercise'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
