import React from 'react';
import { ArrowRight, CheckCircle2, ShieldAlert, Sparkles, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAiSession } from '../context/AiSessionContext';

export default function AiCompletionModal() {
  const { finalResult, showCompletionModal, dismissCompletionModal } = useAiSession();
  const navigate = useNavigate();

  if (!showCompletionModal || !finalResult) {
    return null;
  }

  const {
    finalClassId,
    finalDisplayLabel,
    finalDescription,
    overallConfidence,
    aggregateProbabilities,
    validWindowCount,
    totalWindows,
    completedAt,
    disclaimer,
  } = finalResult;

  const getTheme = () => {
    switch (finalClassId) {
      case 0:
        return {
          badgeBg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
          dotBg: 'bg-emerald-500',
          headerBg: 'bg-emerald-600',
          accentText: 'text-emerald-700',
        };
      case 1:
        return {
          badgeBg: 'bg-amber-50 text-amber-800 border-amber-200',
          dotBg: 'bg-amber-500',
          headerBg: 'bg-amber-600',
          accentText: 'text-amber-700',
        };
      case 2:
      default:
        return {
          badgeBg: 'bg-rose-50 text-rose-800 border-rose-200',
          dotBg: 'bg-rose-500',
          headerBg: 'bg-rose-600',
          accentText: 'text-rose-700',
        };
    }
  };

  const theme = getTheme();

  const handleViewAnalysis = () => {
    dismissCompletionModal();
    navigate('/analytics');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg overflow-hidden bg-white border border-line rounded-2xl shadow-2xl">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-line bg-paper px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-ink text-white shadow-sm">
              <Sparkles size={18} className="text-teal-400" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-ink">
                3-Minute AI Analysis Complete
              </h2>
              <p className="text-xs text-muted">
                Edge Random Forest · Completed at {completedAt}
              </p>
            </div>
          </div>
          <button
            onClick={dismissCompletionModal}
            className="rounded-lg p-1.5 text-muted hover:bg-slate-100 hover:text-ink transition"
            title="Dismiss popup"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-5">
          {/* Main Classification Card */}
          <div className="rounded-xl border border-line bg-slate-50/70 p-5 text-center">
            <span className="text-xs font-medium uppercase tracking-wider text-muted">
              Consolidated 3-Class Prediction
            </span>
            <div className="mt-2 flex flex-wrap items-center justify-center gap-2">
              <span
                className={`inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm font-bold shadow-sm ${theme.badgeBg}`}
              >
                <span className={`h-2.5 w-2.5 rounded-full ${theme.dotBg}`} />
                {finalDisplayLabel}
              </span>
              <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-mono font-bold text-slate-800 shadow-sm">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-muted">Confidence:</span>
                {overallConfidence}%
              </span>
            </div>
            <p className="mt-3 text-xs text-slate-600 leading-relaxed max-w-md mx-auto">
              {finalDescription}
            </p>
          </div>

          {/* Metrics Overview */}
          <div className="grid grid-cols-2 gap-3 text-center">
            <div className="rounded-xl border border-line bg-white p-3.5 shadow-sm">
              <p className="text-xs text-muted">Overall Confidence</p>
              <p className="num mt-1 text-2xl font-bold text-ink">
                {overallConfidence}%
              </p>
              <p className="text-[11px] text-muted mt-0.5">Scikit-learn ensemble vote</p>
            </div>
            <div className="rounded-xl border border-line bg-white p-3.5 shadow-sm">
              <p className="text-xs text-muted">Analyzed Windows</p>
              <p className="num mt-1 text-2xl font-bold text-ink">
                {validWindowCount} / {totalWindows}
              </p>
              <p className="text-[11px] text-muted mt-0.5">30s evaluation segments</p>
            </div>
          </div>

          {/* Probability Distribution */}
          <div className="space-y-2.5 rounded-xl border border-line bg-white p-4">
            <p className="text-xs font-semibold text-slate-700">
              Class Probability Distribution
            </p>
            <div className="space-y-2">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-600">Normal / Healthy</span>
                  <span className="num font-semibold text-ink">
                    {(aggregateProbabilities[0] * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                    style={{ width: `${aggregateProbabilities[0] * 100}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-600">Mild Functional Restriction</span>
                  <span className="num font-semibold text-ink">
                    {(aggregateProbabilities[1] * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-amber-500 transition-all duration-500"
                    style={{ width: `${aggregateProbabilities[1] * 100}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-600">Severe Antalgic / Stiff Gait</span>
                  <span className="num font-semibold text-ink">
                    {(aggregateProbabilities[2] * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-rose-500 transition-all duration-500"
                    style={{ width: `${aggregateProbabilities[2] * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Non-Diagnostic Disclaimer */}
          <div className="flex items-start gap-2 rounded-lg bg-paper p-3 text-[11px] text-muted">
            <ShieldAlert size={15} className="mt-0.5 shrink-0 text-slate-500" />
            <p>{disclaimer}</p>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="flex items-center justify-end gap-2.5 border-t border-line bg-paper px-6 py-4">
          <button
            onClick={dismissCompletionModal}
            className="rounded-lg border border-line bg-white px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 transition"
          >
            Dismiss
          </button>
          <button
            onClick={handleViewAnalysis}
            className="inline-flex items-center gap-1.5 rounded-lg bg-ink px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-slate-700 transition"
          >
            <span>View Detailed AI Log</span>
            <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
