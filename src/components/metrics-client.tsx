'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { logBodyMetric } from '@/app/actions/metric-actions';
import {
  Scale,
  Plus,
  X,
  History,
  Info,
  TrendingDown,
  Sparkles
} from 'lucide-react';

interface MetricsClientProps {
  initialMetrics: any[];
}

export default function MetricsClient({ initialMetrics }: MetricsClientProps) {
  const router = useRouter();
  const [metricModal, setMetricModal] = useState(false);
  const [loading, setLoading] = useState(false);

  // Form states
  const [weight, setWeight] = useState('');
  const [bodyFatPercent, setBodyFatPercent] = useState('');
  const [chest, setChest] = useState('');
  const [waist, setWaist] = useState('');
  const [hip, setHip] = useState('');
  const [arm, setArm] = useState('');
  const [thigh, setThigh] = useState('');
  const [date, setDate] = useState('');

  // Toast
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 4000);
  };

  const handleRecordMetricSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!weight) return;
    setLoading(true);

    const payload = {
      weight: Number(weight),
      bodyFatPercent: bodyFatPercent ? Number(bodyFatPercent) : undefined,
      chest: chest ? Number(chest) : undefined,
      waist: waist ? Number(waist) : undefined,
      hip: hip ? Number(hip) : undefined,
      arm: arm ? Number(arm) : undefined,
      thigh: thigh ? Number(thigh) : undefined,
      date: date || undefined,
    };

    const res = await logBodyMetric(payload);
    setLoading(false);
    if (res.success) {
      setMetricModal(false);
      // Reset Form
      setWeight('');
      setBodyFatPercent('');
      setChest('');
      setWaist('');
      setHip('');
      setArm('');
      setThigh('');
      setDate('');
      
      showToast('⚖️ Body metrics logged successfully!');
      router.refresh();
    } else {
      alert(res.error || 'Failed to log metrics');
    }
  };

  const latestMetric = initialMetrics[0];

  const getBmiCategory = (bmiVal?: number) => {
    if (!bmiVal) return { label: 'Unknown', color: 'text-muted-foreground' };
    if (bmiVal < 18.5) return { label: 'Underweight ⚠️', color: 'text-sky-500' };
    if (bmiVal < 25) return { label: 'Healthy Weight ✅', color: 'text-emerald-500' };
    if (bmiVal < 30) return { label: 'Overweight ⚠️', color: 'text-amber-500' };
    return { label: 'Obese 🚨', color: 'text-rose-500' };
  };

  const bmiInfo = getBmiCategory(latestMetric?.bmi);

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center space-x-3 p-4 rounded-xl border border-primary/20 bg-card text-foreground shadow-2xl animate-bounce">
          <Sparkles className="h-5 w-5 text-emerald-500 shrink-0" />
          <span className="font-bold text-sm">{toast}</span>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-6 rounded-2xl border border-border bg-card/60 backdrop-blur-md shadow-md">
        <div>
          <h1 className="text-3xl font-black tracking-tight leading-tight">Body Measurements</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Track weight, body fat %, and circumference measurements to track muscle growth and composition.
          </p>
        </div>
        <div>
          <button
            onClick={() => setMetricModal(true)}
            className="flex items-center space-x-1 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground font-bold hover:brightness-110 shadow-lg shadow-primary/25 cursor-pointer text-sm"
          >
            <Plus className="h-4 w-4" />
            <span>Record Metrics</span>
          </button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* BMI & Latest Stats Card */}
        <div className="p-6 rounded-2xl border border-border bg-card shadow-sm space-y-6">
          <h3 className="text-lg font-bold">Current Composition</h3>

          {latestMetric ? (
            <div className="space-y-5">
              <div className="p-4 rounded-xl border border-border/80 bg-background/50 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Current Weight</span>
                  <h2 className="text-3xl font-black">{latestMetric.weight} <span className="text-sm font-normal text-muted-foreground">kg</span></h2>
                </div>
                {latestMetric.bodyFatPercent && (
                  <div className="text-right">
                    <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Body Fat</span>
                    <h2 className="text-2xl font-black text-indigo-500">{latestMetric.bodyFatPercent}%</h2>
                  </div>
                )}
              </div>

              {latestMetric.bmi && (
                <div className="p-4 rounded-xl border border-border/80 bg-background/50 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Calculated BMI</span>
                    <span className={`text-xs font-bold ${bmiInfo.color}`}>{bmiInfo.label}</span>
                  </div>
                  <h2 className="text-3xl font-black">{latestMetric.bmi}</h2>
                  <div className="flex items-center text-[10px] text-muted-foreground font-semibold bg-muted p-2 rounded-lg">
                    <Info className="h-3.5 w-3.5 mr-1.5 text-primary shrink-0" />
                    <span>BMI is calculated automatically based on your height.</span>
                  </div>
                </div>
              )}

              {/* Tape measurements */}
              <div className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">Circumferences</span>
                <div className="grid grid-cols-2 gap-2 text-xs font-medium">
                  <div className="p-2.5 rounded bg-muted/50 flex justify-between">
                    <span className="text-muted-foreground">Chest:</span>
                    <span className="font-bold">{latestMetric.chest ? `${latestMetric.chest} cm` : '--'}</span>
                  </div>
                  <div className="p-2.5 rounded bg-muted/50 flex justify-between">
                    <span className="text-muted-foreground">Waist:</span>
                    <span className="font-bold">{latestMetric.waist ? `${latestMetric.waist} cm` : '--'}</span>
                  </div>
                  <div className="p-2.5 rounded bg-muted/50 flex justify-between">
                    <span className="text-muted-foreground">Hips:</span>
                    <span className="font-bold">{latestMetric.hip ? `${latestMetric.hip} cm` : '--'}</span>
                  </div>
                  <div className="p-2.5 rounded bg-muted/50 flex justify-between">
                    <span className="text-muted-foreground">Thighs:</span>
                    <span className="font-bold">{latestMetric.thigh ? `${latestMetric.thigh} cm` : '--'}</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 border border-dashed border-border rounded-xl">
              <Scale className="h-10 w-10 text-muted-foreground/60 mb-2" />
              <p className="text-sm font-semibold text-muted-foreground">No metrics recorded yet.</p>
            </div>
          )}
        </div>

        {/* History Logs Table */}
        <div className="lg:col-span-2 p-6 rounded-2xl border border-border bg-card shadow-sm space-y-6">
          <h3 className="text-lg font-bold">Measurement Logs History</h3>

          {initialMetrics.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 border border-dashed border-border rounded-xl bg-background/50">
              <History className="h-10 w-10 text-muted-foreground/60 mb-2" />
              <p className="text-sm font-semibold text-muted-foreground">No history logs.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-border/60 text-muted-foreground uppercase font-bold">
                    <th className="py-3">Date</th>
                    <th className="py-3 text-center">Weight</th>
                    <th className="py-3 text-center">BMI</th>
                    <th className="py-3 text-center">Body Fat</th>
                    <th className="py-3 text-center">Waist</th>
                    <th className="py-3 text-center">Chest</th>
                  </tr>
                </thead>
                <tbody>
                  {initialMetrics.map((met, idx) => (
                    <tr key={idx} className="border-b border-border/20 hover:bg-muted/10 font-medium">
                      <td className="py-3 font-semibold">
                        {new Date(met.date).toLocaleDateString('en-US', { dateStyle: 'medium' })}
                      </td>
                      <td className="py-3 text-center font-bold font-mono">{met.weight} kg</td>
                      <td className="py-3 text-center font-mono">{met.bmi || '--'}</td>
                      <td className="py-3 text-center font-mono">{met.bodyFatPercent ? `${met.bodyFatPercent}%` : '--'}</td>
                      <td className="py-3 text-center font-mono">{met.waist ? `${met.waist} cm` : '--'}</td>
                      <td className="py-3 text-center font-mono">{met.chest ? `${met.chest} cm` : '--'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* RECORD METRICS MODAL */}
      {metricModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-card border border-border rounded-2xl shadow-2xl p-6 relative">
            <button
              onClick={() => setMetricModal(false)}
              className="absolute top-4 right-4 p-1 rounded-md hover:bg-muted text-muted-foreground transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
            <div className="mb-4">
              <h3 className="text-xl font-bold flex items-center space-x-2">
                <Scale className="h-5 w-5 text-primary" />
                <span>Record Body Metrics</span>
              </h3>
              <p className="text-xs text-muted-foreground mt-1">Record weight and body parts circumferences.</p>
            </div>

            <form onSubmit={handleRecordMetricSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase text-muted-foreground">Weight (kg) *</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={weight}
                    onChange={e => setWeight(e.target.value)}
                    placeholder="75.5"
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:ring-1 focus:ring-primary focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase text-muted-foreground">Body Fat (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={bodyFatPercent}
                    onChange={e => setBodyFatPercent(e.target.value)}
                    placeholder="15.2"
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:ring-1 focus:ring-primary focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase text-muted-foreground">Chest circ (cm)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={chest}
                    onChange={e => setChest(e.target.value)}
                    placeholder="98"
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:ring-1 focus:ring-primary focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase text-muted-foreground">Waist circ (cm)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={waist}
                    onChange={e => setWaist(e.target.value)}
                    placeholder="84"
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-muted-foreground">Hip (cm)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={hip}
                    onChange={e => setHip(e.target.value)}
                    placeholder="92"
                    className="w-full px-2 py-1.5 rounded-lg border border-border bg-background text-xs text-center"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-muted-foreground">Arm (cm)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={arm}
                    onChange={e => setArm(e.target.value)}
                    placeholder="34"
                    className="w-full px-2 py-1.5 rounded-lg border border-border bg-background text-xs text-center"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-muted-foreground">Thigh (cm)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={thigh}
                    onChange={e => setThigh(e.target.value)}
                    placeholder="55"
                    className="w-full px-2 py-1.5 rounded-lg border border-border bg-background text-xs text-center"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold uppercase text-muted-foreground">Date (Optional)</label>
                <input
                  type="date"
                  value={date}
                  onChange={e => setDate(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-bold hover:brightness-115 disabled:opacity-50 transition-all cursor-pointer"
              >
                {loading ? 'Recording...' : 'Confirm Record'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
