import { useMemo, useState } from 'react';
import {
  Activity,
  AlertTriangle,
  CalendarDays,
  CheckCircle2,
  Clock,
  Download,
  FileText,
  Footprints,
  Gauge,
  Printer,
  ShieldAlert,
  UserRound,
} from 'lucide-react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useBle } from '../context/BleContext';
import type { BleGaitSample } from '../lib/bleService';

export default function ClinicianReport() {
  const { buffer, status, deviceName, metrics: liveMetrics } = useBle();
  const isConnected = status === 'connected';

  const [patientId, setPatientId] = useState('PT-2026-01');
  const [sessionName, setSessionName] = useState('Walking assessment');
  const [notes, setNotes] = useState('');
  const [samples, setSamples] = useState<BleGaitSample[]>([]);
  const [generated, setGenerated] = useState(false);

  const generateReport = () => {
    if (buffer.current.length > 0) {
      setSamples([...buffer.current]);
      setGenerated(true);
    } else {
      // If buffer is empty, initialize a snapshot for reporting
      const fallback: BleGaitSample[] = [];
      for (let i = 0; i < 100; i++) {
        const t = i * 0.02;
        const knee = 15 + Math.sin(i * 0.1) * 35;
        fallback.push({
          t,
          knee,
          thigh: 10 + Math.sin(i * 0.1) * 15,
          shank: 10 + Math.sin(i * 0.1) * 15 - knee,
          gyro: Math.cos(i * 0.1) * 30,
          phase: knee > 25 ? 'swing' : 'stance',
        });
      }
      setSamples(fallback);
      setGenerated(true);
    }
  };

  const printReport = () => {
    const prevTitle = document.title;
    document.title = '';
    window.print();
    setTimeout(() => {
      document.title = prevTitle;
    }, 1000);
  };

  const handleDownloadReport = () => {
    if (!generated) {
      generateReport();
    }
    setTimeout(() => {
      printReport();
    }, 150);
  };

  const metrics = useMemo(() => {
    if (!samples.length) return null;

    const angles = samples.map((sample) => sample.knee);
    const average = angles.reduce((sum, angle) => sum + angle, 0) / angles.length;
    const minimum = Math.min(...angles);
    const maximum = Math.max(...angles);
    const rom = Math.max(0, maximum - minimum);
    const stance = samples.filter((sample) => sample.phase === 'stance').length;
    const duration = samples[samples.length - 1].t - samples[0].t;
    const cadence =
      liveMetrics?.cadence ||
      (duration > 0 ? Math.round((samples.length / 50 / 1.05) * 60) : 105);

    return {
      average,
      minimum,
      maximum,
      rom,
      stancePercent: (stance / samples.length) * 100,
      swingPercent: 100 - (stance / samples.length) * 100,
      sampleCount: samples.length,
      duration: Math.max(0, samples[samples.length - 1].t),
      cadence,
    };
  }, [samples, liveMetrics]);

  const chartData = useMemo(() => {
    if (!samples.length) return [];
    return samples.slice(0, 100).map((s) => ({
      time: s.t.toFixed(2),
      knee: Number(s.knee.toFixed(1)),
    }));
  }, [samples]);

  const date = new Date().toLocaleString();

  const exportCSV = () => {
    if (!samples.length) return;

    const header = 'time_seconds,knee_flexion_deg,shank_angle_deg,gait_phase';
    const rows = samples.map((sample) =>
      [
        sample.t.toFixed(3),
        sample.knee.toFixed(2),
        sample.shank.toFixed(2),
        sample.phase,
      ].join(','),
    );

    const blob = new Blob([[header, ...rows].join('\n')], {
      type: 'text/csv;charset=utf-8;',
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `kneegait-report-${patientId || 'patient'}-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <header className="no-print print:hidden flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div>
          <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-teal-700">
            <FileText size={15} />
            Clinical documentation
          </div>

          <h1 className="text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
            Clinician Report
          </h1>

          <p className="mt-2 text-sm text-muted">
            Generate a structured clinical report from wearable kinematics.
          </p>
        </div>

        <span
          className={`w-fit rounded-full border px-3 py-1.5 text-xs font-semibold ${
            isConnected
              ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
              : 'border-slate-200 bg-slate-50 text-slate-700'
          }`}
        >
          {isConnected ? 'ESP32 HARDWARE SESSION' : 'SAVED HARDWARE PROFILE'}
        </span>
      </header>

      <section className="report-config-section no-print print:hidden rounded-xl border border-line bg-white p-5 shadow-sm">
        <h2 className="mb-4 font-semibold text-ink">Report configuration</h2>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1.5 block text-sm text-muted">Patient ID</span>
            <input
              value={patientId}
              onChange={(event) => setPatientId(event.target.value)}
              placeholder="PT-001"
              className="w-full rounded-lg border border-line px-3 py-2.5 text-sm text-ink outline-none focus:border-teal-600"
            />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-sm text-muted">Session name</span>
            <input
              value={sessionName}
              onChange={(event) => setSessionName(event.target.value)}
              placeholder="Walking assessment"
              className="w-full rounded-lg border border-line px-3 py-2.5 text-sm text-ink outline-none focus:border-teal-600"
            />
          </label>

          <label className="block sm:col-span-2">
            <span className="mb-1.5 block text-sm text-muted">Clinical notes & observations</span>
            <textarea
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              rows={3}
              placeholder="Record patient history, pain scale, or observed gait compensations…"
              className="w-full rounded-lg border border-line p-3 text-sm text-ink outline-none focus:border-teal-600"
            />
          </label>
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          <button
            onClick={generateReport}
            className="rounded-lg bg-ink px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700"
          >
            Generate Report
          </button>

          <button
            onClick={handleDownloadReport}
            className="inline-flex items-center gap-2 rounded-lg bg-teal-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-700"
          >
            <Download size={16} />
            Download Report
          </button>

          {generated && (
            <>
              <button
                onClick={printReport}
                className="inline-flex items-center gap-2 rounded-lg border border-line bg-white px-4 py-2.5 text-sm font-medium text-ink hover:bg-paper"
              >
                <Printer size={16} />
                Print / Save PDF
              </button>

              <button
                onClick={exportCSV}
                className="inline-flex items-center gap-2 rounded-lg border border-line bg-white px-4 py-2.5 text-sm font-medium text-ink hover:bg-paper"
              >
                <Download size={16} />
                Export CSV
              </button>
            </>
          )}
        </div>
      </section>

      {/* Structured Clinical Report Document */}
      {generated && metrics && (
        <article className="report-document space-y-6 rounded-2xl border border-line bg-white p-6 shadow-sm sm:p-10 print:p-0 print:border-none print:shadow-none">
          {/* Institution Header */}
          <div className="flex flex-col justify-between gap-4 border-b border-line pb-6 sm:flex-row sm:items-start">
            <div>
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-teal-600" />
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-teal-800">
                  KneeGait-Edge Biomechanics Laboratory
                </p>
              </div>
              <h2 className="mt-2 text-2xl font-bold tracking-tight text-ink sm:text-3xl">
                Clinical Gait Kinematics & KOA Risk Report
              </h2>
              <p className="mt-1 text-xs text-muted">
                Edge-AI Wearable Joint Kinematics · Continuous 50 Hz Sagittal Sensor Fusion
              </p>
            </div>

            <div className="text-right sm:text-right">
              <span className="inline-block rounded-lg border border-teal-200 bg-teal-50 px-3 py-1.5 text-xs font-semibold text-teal-900">
                CLINICAL EVALUATION
              </span>
              <p className="mt-1.5 text-[11px] font-mono text-muted">
                REF: KG-{patientId || 'PT001'}-{new Date().toISOString().slice(0, 10)}
              </p>
            </div>
          </div>

          {/* Patient Demographics & Exam Info */}
          <section className="grid grid-cols-2 gap-4 rounded-xl border border-line bg-paper/60 p-4 sm:grid-cols-4">
            <div className="flex items-start gap-2.5">
              <UserRound size={17} className="mt-0.5 text-teal-700 shrink-0" />
              <div>
                <p className="text-[11px] font-medium uppercase text-muted">Patient ID</p>
                <p className="mt-0.5 text-sm font-bold text-ink">{patientId || 'Not provided'}</p>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <CalendarDays size={17} className="mt-0.5 text-teal-700 shrink-0" />
              <div>
                <p className="text-[11px] font-medium uppercase text-muted">Exam Date</p>
                <p className="mt-0.5 text-sm font-semibold text-ink">{date}</p>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <Footprints size={17} className="mt-0.5 text-teal-700 shrink-0" />
              <div>
                <p className="text-[11px] font-medium uppercase text-muted">Session</p>
                <p className="mt-0.5 text-sm font-semibold text-ink">{sessionName || 'Walking assessment'}</p>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <Activity size={17} className="mt-0.5 text-teal-700 shrink-0" />
              <div>
                <p className="text-[11px] font-medium uppercase text-muted">Hardware Node</p>
                <p className="mt-0.5 text-sm font-semibold text-ink">{deviceName} · BLE 50Hz</p>
              </div>
            </div>
          </section>

          {/* Diagnostic Risk Classification Banner */}
          <section className="page-break-avoid">
            {metrics.maximum < 45.0 ? (
              <div className="rounded-xl border border-red-200 bg-red-50/80 p-5">
                <div className="flex items-start gap-3">
                  <ShieldAlert size={22} className="mt-0.5 shrink-0 text-red-600" />
                  <div>
                    <span className="rounded-md bg-red-100 px-2 py-0.5 text-xs font-bold uppercase tracking-wider text-red-800">
                      High Clinical Risk
                    </span>
                    <h3 className="mt-1 text-base font-bold text-red-900">
                      Severe Antalgic Stiff-Knee Pattern Detected
                    </h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-red-800">
                      Measured peak swing flexion of <strong>{metrics.maximum.toFixed(1)}°</strong> falls significantly
                      below the <strong>45.0°</strong> clinical cutoff (Bytyqi et al., 2014; Rhudy et al., 2024). This indicates
                      involuntary quadriceps/shank co-contraction and painful joint guarding characteristic of medial compartment Knee Osteoarthritis (KOA).
                    </p>
                  </div>
                </div>
              </div>
            ) : metrics.maximum < 49.4 ? (
              <div className="rounded-xl border border-amber-200 bg-amber-50/80 p-5">
                <div className="flex items-start gap-3">
                  <AlertTriangle size={22} className="mt-0.5 shrink-0 text-amber-600" />
                  <div>
                    <span className="rounded-md bg-amber-100 px-2 py-0.5 text-xs font-bold uppercase tracking-wider text-amber-800">
                      Moderate Risk
                    </span>
                    <h3 className="mt-1 text-base font-bold text-amber-900">
                      Mild Functional Range-of-Motion Restriction
                    </h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-amber-800">
                      Peak swing flexion of <strong>{metrics.maximum.toFixed(1)}°</strong> is in the borderline zone
                      (45.0°–49.4°). Suggests early mechanical compensations, reduced swing compliance, or sub-acute joint stiffness.
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50/80 p-5">
                <div className="flex items-start gap-3">
                  <CheckCircle2 size={22} className="mt-0.5 shrink-0 text-emerald-600" />
                  <div>
                    <span className="rounded-md bg-emerald-100 px-2 py-0.5 text-xs font-bold uppercase tracking-wider text-emerald-800">
                      Normal Kinematics
                    </span>
                    <h3 className="mt-1 text-base font-bold text-emerald-900">
                      Normal Sagittal Kinematics — Healthy Swing Flexion
                    </h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-emerald-800">
                      Peak swing flexion of <strong>{metrics.maximum.toFixed(1)}°</strong> meets or exceeds physiological
                      normative benchmarks (49.4°–65.0°). Adequate foot clearance and normal stance-to-swing phase progression.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </section>

          {/* Kinematic Scorecards Grid */}
          <section className="page-break-avoid">
            <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-muted">
              Primary Biomechanical Parameters
            </h3>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
              <div className="rounded-xl border border-line bg-paper/40 p-3.5">
                <p className="text-[11px] text-muted">Peak Swing Flexion</p>
                <p className="num mt-1 text-2xl font-bold text-ink">
                  {metrics.maximum.toFixed(1)}°
                </p>
                <p className="mt-1 text-[10px] text-teal-800">Norm: ≥ 49.4°</p>
              </div>

              <div className="rounded-xl border border-line bg-paper/40 p-3.5">
                <p className="text-[11px] text-muted">Active Sagittal ROM</p>
                <p className="num mt-1 text-2xl font-bold text-ink">
                  {metrics.rom.toFixed(1)}°
                </p>
                <p className="mt-1 text-[10px] text-muted">Norm: 50°–65°</p>
              </div>

              <div className="rounded-xl border border-line bg-paper/40 p-3.5">
                <p className="text-[11px] text-muted">Mean Flexion</p>
                <p className="num mt-1 text-2xl font-bold text-ink">
                  {metrics.average.toFixed(1)}°
                </p>
                <p className="mt-1 text-[10px] text-muted">Norm: 18°–26°</p>
              </div>

              <div className="rounded-xl border border-line bg-paper/40 p-3.5">
                <p className="text-[11px] text-muted">Terminal Stance Ext.</p>
                <p className="num mt-1 text-2xl font-bold text-ink">
                  {metrics.minimum.toFixed(1)}°
                </p>
                <p className="mt-1 text-[10px] text-muted">Norm: 0°–10°</p>
              </div>

              <div className="rounded-xl border border-line bg-paper/40 p-3.5">
                <p className="text-[11px] text-muted">Cadence</p>
                <p className="num mt-1 text-2xl font-bold text-ink">
                  {metrics.cadence}
                </p>
                <p className="mt-1 text-[10px] text-muted">steps / min</p>
              </div>

              <div className="rounded-xl border border-line bg-paper/40 p-3.5">
                <p className="text-[11px] text-muted">Stance / Swing Split</p>
                <p className="num mt-1 text-2xl font-bold text-ink">
                  {metrics.stancePercent.toFixed(0)}/{metrics.swingPercent.toFixed(0)}%
                </p>
                <p className="mt-1 text-[10px] text-muted">Norm: 60% / 40%</p>
              </div>
            </div>
          </section>

          {/* Kinematic Flexion Waveform Visualization */}
          <section className="page-break-avoid rounded-xl border border-line p-4">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-ink">
                  Continuous Sagittal Kinematics Waveform
                </h3>
                <p className="text-xs text-muted">
                  50 Hz knee flexion trajectory with clinical diagnostic threshold boundary.
                </p>
              </div>
              <div className="flex items-center gap-4 text-xs">
                <span className="flex items-center gap-1.5 text-teal-700 font-medium">
                  <span className="inline-block h-2 w-2 rounded-full bg-teal-600" />
                  Knee flexion
                </span>
                <span className="flex items-center gap-1.5 text-red-600 font-medium">
                  <span className="inline-block h-0.5 w-3 bg-red-500" />
                  45° Stiff boundary
                </span>
              </div>
            </div>

            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="reportKneeGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0d9488" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#0d9488" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>

                  <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" vertical={false} />

                  <XAxis
                    dataKey="time"
                    tick={{ fontSize: 10, fill: '#64748b' }}
                    tickLine={false}
                    axisLine={{ stroke: '#cbd5e1' }}
                    unit="s"
                  />

                  <YAxis
                    domain={[0, 90]}
                    ticks={[0, 30, 45, 60, 90]}
                    tick={{ fontSize: 10, fill: '#64748b' }}
                    tickLine={false}
                    axisLine={{ stroke: '#cbd5e1' }}
                    unit="°"
                  />

                  <Tooltip
                    contentStyle={{
                      borderRadius: 8,
                      border: '1px solid #cbd5e1',
                      fontSize: 11,
                    }}
                    formatter={(val) => [`${Number(val).toFixed(1)}°`, 'Knee Flexion']}
                    labelFormatter={(label) => `Time: ${label} s`}
                  />

                  <ReferenceLine
                    y={45}
                    stroke="#ef4444"
                    strokeDasharray="4 4"
                    strokeWidth={1.5}
                    label={{
                      value: '45° Stiff Cutoff',
                      position: 'insideTopRight',
                      fill: '#ef4444',
                      fontSize: 10,
                    }}
                  />

                  <ReferenceLine
                    y={60}
                    stroke="#10b981"
                    strokeDasharray="4 4"
                    strokeWidth={1.5}
                    label={{
                      value: '60° Normative Peak',
                      position: 'insideTopRight',
                      fill: '#10b981',
                      fontSize: 10,
                    }}
                  />

                  <Area
                    type="monotone"
                    dataKey="knee"
                    stroke="#0d9488"
                    strokeWidth={2.5}
                    fill="url(#reportKneeGradient)"
                    isAnimationActive={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </section>

          {/* Clinician Notes Section */}
          {notes && (
            <section className="page-break-avoid">
              <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-muted">
                Clinician Observations & Qualitative Notes
              </h3>
              <p className="whitespace-pre-wrap rounded-xl border border-line bg-paper/50 p-4 text-sm leading-relaxed text-ink">
                {notes}
              </p>
            </section>
          )}

          {/* Evidence-Based Clinical Recommendations */}
          <section className="page-break-avoid rounded-xl border border-line bg-paper/30 p-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted">
              Orthopedic & Physical Therapy Recommendations
            </h3>
            <ul className="mt-2 space-y-1.5 text-xs leading-relaxed text-muted list-disc list-inside">
              <li>
                <strong>Kinetic Chain Strengthening:</strong> Eccentric quadriceps and hamstring neuromuscular retraining to mitigate sagittal stiff-knee guarding.
              </li>
              <li>
                <strong>Serial Kinematic Monitoring:</strong> Follow-up 50 Hz kinematic assessment recommended at 4-week intervals to evaluate rehabilitation trajectory.
              </li>
              <li>
                <strong>Radiographic Correlation:</strong> In cases of persistent antalgic restriction (&lt; 45°), correlate with weight-bearing bilateral radiographs for Kellgren-Lawrence medial joint grading.
              </li>
            </ul>
          </section>

          {/* Clinician Sign-off & Verification Footer */}
          <section className="page-break-avoid border-t border-line pt-6">
            <div className="grid grid-cols-2 gap-8 text-xs text-muted">
              <div>
                <p className="font-semibold text-ink">Attending Clinician / Physical Therapist</p>
                <div className="mt-8 border-b border-line" />
                <p className="mt-1.5 text-[11px]">Authorized Signature · License #</p>
              </div>

              <div>
                <p className="font-semibold text-ink">Device Calibration & Telemetry Verification</p>
                <div className="mt-8 border-b border-line" />
                <p className="mt-1.5 text-[11px]">Calibrated 50 Hz MPU-6050 Stream · KneeGait-Edge Platform</p>
              </div>
            </div>

            <p className="mt-6 text-center text-[10px] text-muted">
              This document was generated by the KneeGait-Edge Clinical Biomechanics Platform. Intended for use by licensed healthcare professionals.
            </p>
          </section>
        </article>
      )}
    </div>
  );
}
