import React, { useState } from 'react';
import {
  AlertCircle,
  BrainCircuit,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
  Layers,
  Play,
  RotateCcw,
  ShieldAlert,
  Sparkles,
  StopCircle,
} from 'lucide-react';
import { useBle } from '../context/BleContext';
import { useAiSession, WindowPredictionLog } from '../context/AiSessionContext';

export default function AiAnalysisLogSection() {
  const { status: bleStatus, connect } = useBle();
  const isBleConnected = bleStatus === 'connected';

  const {
    status,
    statusMessage,
    elapsedSeconds,
    currentWindowIndex,
    windowSecondsRemaining,
    logs,
    finalResult,
    startSession,
    stopSession,
    resetSession,
  } = useAiSession();

  const [expandedRow, setExpandedRow] = useState<number | null>(null);

  const toggleRow = (idx: number) => {
    setExpandedRow((prev) => (prev === idx ? null : idx));
  };

  const getClassTheme = (classId: number) => {
    switch (classId) {
      case 0:
        return {
          badge: 'bg-emerald-50 text-emerald-800 border-emerald-200',
          dot: 'bg-emerald-500',
          border: 'border-emerald-200',
        };
      case 1:
        return {
          badge: 'bg-amber-50 text-amber-800 border-amber-200',
          dot: 'bg-amber-500',
          border: 'border-amber-200',
        };
      case 2:
      default:
        return {
          badge: 'bg-rose-50 text-rose-800 border-rose-200',
          dot: 'bg-rose-500',
          border: 'border-rose-200',
        };
    }
  };

  const formatTimer = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const isRunning = status === 'running';

  return (
    <section className="space-y-4 rounded-xl border border-line bg-white p-5 shadow-sm">
      {/* Section Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-teal-700">
            <BrainCircuit size={16} />
            Edge Machine Learning
          </div>
          <h2 className="text-xl font-semibold text-ink">AI Analysis Log</h2>
          <p className="mt-0.5 text-xs text-muted">
            Offline 3-minute continuous classification (six 30-second prediction windows) using the trained Random Forest model.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {!isRunning ? (
            <button
              onClick={startSession}
              disabled={!isBleConnected}
              className="inline-flex items-center gap-1.5 rounded-lg bg-ink px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50 transition"
            >
              <Play size={14} className="fill-white" />
              <span>Start 3-Minute Assessment</span>
            </button>
          ) : (
            <button
              onClick={stopSession}
              className="inline-flex items-center gap-1.5 rounded-lg border border-rose-300 bg-rose-50 px-4 py-2 text-xs font-semibold text-rose-800 shadow-sm hover:bg-rose-100 transition"
            >
              <StopCircle size={14} />
              <span>Stop Session</span>
            </button>
          )}

          <button
            onClick={resetSession}
            disabled={isRunning}
            className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 transition"
            title="Reset AI session and clear log"
          >
            <RotateCcw size={14} />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* Progress & Countdown Bar */}
      <div className="rounded-xl border border-line bg-slate-50/70 p-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between text-xs">
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 font-semibold ${
                isRunning
                  ? 'bg-teal-100 text-teal-800'
                  : status === 'completed'
                  ? 'bg-emerald-100 text-emerald-800'
                  : status === 'interrupted'
                  ? 'bg-rose-100 text-rose-800'
                  : 'bg-slate-200 text-slate-700'
              }`}
            >
              {isRunning && <span className="h-1.5 w-1.5 rounded-full bg-teal-600 animate-ping" />}
              {status === 'running'
                ? `Window ${currentWindowIndex} of 6 In Progress`
                : status === 'completed'
                ? 'Analysis Completed'
                : status === 'interrupted'
                ? 'Session Interrupted'
                : 'Session Standby'}
            </span>
            <span className="text-muted">
              {statusMessage}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 font-mono font-semibold text-ink">
              <Clock size={13} className="text-muted" />
              <span>{formatTimer(elapsedSeconds)} / 03:00</span>
            </div>
            {isRunning && (
              <span className="text-muted font-mono">
                ({windowSecondsRemaining}s window remaining)
              </span>
            )}
          </div>
        </div>

        {/* 6-Window Segmented Progress Bar */}
        <div className="mt-3 grid grid-cols-6 gap-1.5">
          {[1, 2, 3, 4, 5, 6].map((winNum) => {
            const isCompleted = logs.length >= winNum;
            const isCurrent = isRunning && currentWindowIndex === winNum;
            const logEntry = logs[winNum - 1];

            return (
              <div key={winNum} className="space-y-1">
                <div
                  className={`h-2 rounded-full transition-all duration-300 ${
                    isCompleted
                      ? logEntry?.isValid
                        ? 'bg-teal-600'
                        : 'bg-amber-400'
                      : isCurrent
                      ? 'bg-teal-300 animate-pulse'
                      : 'bg-slate-200'
                  }`}
                />
                <div className="flex justify-between text-[10px] text-muted">
                  <span>W{winNum}</span>
                  <span>{winNum * 30}s</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Prominent Consolidated Final AI Result (Renders after 3 minutes) */}
      {finalResult && (
        <div className="rounded-xl border border-teal-200 bg-gradient-to-br from-teal-50/70 via-white to-slate-50 p-5 shadow-sm animate-fade-in">
          <div className="flex items-center justify-between border-b border-teal-100 pb-3 mb-4">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-600 text-white">
                <Sparkles size={16} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-ink">
                  Consolidated AI Analysis Result
                </h3>
                <p className="text-[11px] text-muted">
                  Aggregated over {finalResult.validWindowCount} of {finalResult.totalWindows} completed 30s prediction windows
                </p>
              </div>
            </div>

            <span
              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold ${
                getClassTheme(finalResult.finalClassId).badge
              }`}
            >
              <span
                className={`h-2 w-2 rounded-full ${
                  getClassTheme(finalResult.finalClassId).dot
                }`}
              />
              {finalResult.finalDisplayLabel}
            </span>
          </div>

          <div className="grid gap-4 md:grid-cols-[1fr_280px]">
            <div className="space-y-3">
              <div className="rounded-lg bg-white p-3.5 border border-line">
                <p className="text-xs font-medium text-muted">Biomechanical Pattern Assessment</p>
                <p className="mt-1 text-sm font-semibold text-ink">
                  {finalResult.finalDisplayLabel} ({finalResult.overallConfidence}% overall confidence)
                </p>
                <p className="mt-1 text-xs text-slate-600 leading-relaxed">
                  {finalResult.finalDescription}
                </p>
              </div>

              {/* Disclaimer */}
              <div className="flex items-start gap-2 rounded-lg bg-paper p-2.5 text-[11px] text-muted">
                <ShieldAlert size={14} className="mt-0.5 shrink-0 text-slate-500" />
                <p>{finalResult.disclaimer}</p>
              </div>
            </div>

            {/* Probability Breakdown */}
            <div className="rounded-lg bg-white p-3.5 border border-line space-y-2.5">
              <p className="text-xs font-semibold text-ink">Aggregate Probabilities</p>
              <div className="space-y-2">
                <div>
                  <div className="flex justify-between text-[11px] mb-0.5">
                    <span className="text-muted">Normal / Healthy</span>
                    <span className="num font-semibold text-ink">
                      {(finalResult.aggregateProbabilities[0] * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-emerald-500"
                      style={{ width: `${finalResult.aggregateProbabilities[0] * 100}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-[11px] mb-0.5">
                    <span className="text-muted">Mild Functional Restriction</span>
                    <span className="num font-semibold text-ink">
                      {(finalResult.aggregateProbabilities[1] * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-amber-500"
                      style={{ width: `${finalResult.aggregateProbabilities[1] * 100}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-[11px] mb-0.5">
                    <span className="text-muted">Severe Antalgic / Stiff Gait</span>
                    <span className="num font-semibold text-ink">
                      {(finalResult.aggregateProbabilities[2] * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-rose-500"
                      style={{ width: `${finalResult.aggregateProbabilities[2] * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* AI Analysis Log Entries */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted">
            Window Prediction Records ({logs.length} / 6)
          </h3>
          <span className="text-xs text-muted">
            Evaluated every 30s @ 50Hz (~1,500 samples/window)
          </span>
        </div>

        {logs.length === 0 && !isRunning && (
          <div className="rounded-xl border border-dashed border-line bg-paper/50 p-8 text-center">
            <BrainCircuit size={28} className="mx-auto text-muted/60" />
            <p className="mt-2 text-sm font-medium text-ink">No AI analysis records yet</p>
            <p className="mt-1 text-xs text-muted max-w-md mx-auto">
              Ensure your ESP32 wearable is streaming sensor data, then click "Start 3-Minute Assessment" above.
              A prediction will be computed locally in-browser every 30 seconds.
            </p>
          </div>
        )}

        <div className="space-y-2.5">
          {logs.map((log) => {
            const isExpanded = expandedRow === log.windowNumber;
            const theme = getClassTheme(log.predictedClassId);

            return (
              <div
                key={log.windowNumber}
                className="rounded-xl border border-line bg-white shadow-sm overflow-hidden transition"
              >
                {/* Main Row Summary */}
                <div
                  onClick={() => toggleRow(log.windowNumber)}
                  className="flex flex-col gap-2 p-3.5 sm:flex-row sm:items-center sm:justify-between cursor-pointer hover:bg-slate-50/70"
                >
                  <div className="flex items-center gap-3">
                    <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-paper text-xs font-bold font-mono text-ink">
                      0{log.windowNumber}
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-ink">
                          {log.timeInterval}
                        </span>
                        <span className="text-[11px] text-muted">
                          · {log.timestamp}
                        </span>
                      </div>
                      <p className="text-[11px] text-muted">
                        {log.isValid
                          ? `${log.sampleCount} samples · ${log.strideCount} complete strides`
                          : log.statusMessage}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {log.isValid ? (
                      <div className="flex items-center gap-2">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${theme.badge}`}
                        >
                          <span className={`h-1.5 w-1.5 rounded-full ${theme.dot}`} />
                          {log.predictedDisplayLabel}
                        </span>
                        <span className="text-xs font-mono font-bold text-ink">
                          {log.confidence}%
                        </span>
                      </div>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-800">
                        <AlertCircle size={12} />
                        Incomplete Window
                      </span>
                    )}

                    <button
                      className="p-1 text-muted hover:text-ink transition"
                      aria-label="Toggle details"
                    >
                      {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </button>
                  </div>
                </div>

                {/* Expanded Biomechanical Features Drawer */}
                {isExpanded && log.isValid && (
                  <div className="border-t border-line bg-slate-50/60 p-4 animate-fade-in space-y-3">
                    <div>
                      <p className="text-[11px] font-semibold text-slate-700">
                        Extracted 5 Canonical Gait Features:
                      </p>
                      <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-5 text-center">
                        <div className="rounded-lg border border-line bg-white p-2">
                          <p className="text-[10px] text-muted">Peak Swing Flexion</p>
                          <p className="num text-sm font-semibold text-ink">
                            {log.features[0].toFixed(1)}°
                          </p>
                          <p className="text-[9px] text-muted">Norm: ≥49.4°</p>
                        </div>

                        <div className="rounded-lg border border-line bg-white p-2">
                          <p className="text-[10px] text-muted">Sagittal ROM</p>
                          <p className="num text-sm font-semibold text-ink">
                            {log.features[1].toFixed(1)}°
                          </p>
                          <p className="text-[9px] text-muted">Flexion range</p>
                        </div>

                        <div className="rounded-lg border border-line bg-white p-2">
                          <p className="text-[10px] text-muted">Stance / Swing</p>
                          <p className="num text-sm font-semibold text-ink">
                            {log.features[2].toFixed(2)}
                          </p>
                          <p className="text-[9px] text-muted">Duration ratio</p>
                        </div>

                        <div className="rounded-lg border border-line bg-white p-2">
                          <p className="text-[10px] text-muted">Peak Ang. Velocity</p>
                          <p className="num text-sm font-semibold text-ink">
                            {log.features[3].toFixed(1)}°/s
                          </p>
                          <p className="text-[9px] text-muted">Gyro max</p>
                        </div>

                        <div className="rounded-lg border border-line bg-white p-2">
                          <p className="text-[10px] text-muted">Cadence</p>
                          <p className="num text-sm font-semibold text-ink">
                            {log.features[4].toFixed(1)} spm
                          </p>
                          <p className="text-[9px] text-muted">Steps / min</p>
                        </div>
                      </div>
                    </div>

                    {/* Window Probabilities Bar */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-[11px] text-slate-600">
                      <span>Probabilities:</span>
                      <div className="flex items-center gap-3 font-mono">
                        <span className="text-emerald-700">
                          Normal: {(log.probabilities[0] * 100).toFixed(1)}%
                        </span>
                        <span className="text-amber-700">
                          Mild: {(log.probabilities[1] * 100).toFixed(1)}%
                        </span>
                        <span className="text-rose-700">
                          Severe: {(log.probabilities[2] * 100).toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {/* Active Window Placeholder */}
          {isRunning && currentWindowIndex <= 6 && (
            <div className="rounded-xl border border-dashed border-teal-300 bg-teal-50/40 p-4 text-xs text-teal-900 animate-pulse flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="flex h-6 w-6 items-center justify-center rounded-md bg-teal-600 text-white font-mono font-bold text-[11px]">
                  0{currentWindowIndex}
                </span>
                <span>
                  Collecting Window {currentWindowIndex} sensor data (50Hz)…
                </span>
              </div>
              <span className="font-mono font-semibold text-teal-800">
                {windowSecondsRemaining}s left
              </span>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
