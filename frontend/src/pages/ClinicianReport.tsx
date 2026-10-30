import { useMemo, useState } from 'react';
import {
  Activity,
  CalendarDays,
  Download,
  FileText,
  Footprints,
  Printer,
  UserRound,
} from 'lucide-react';
import {
  createMockGaitStream,
  type GaitMode,
  type GaitSample,
} from '../lib/mockGaitStream';

export default function ClinicianReport() {
  const [patientId, setPatientId] = useState('DEMO-001');
  const [sessionName, setSessionName] = useState('Walking assessment');
  const [notes, setNotes] = useState('');
  const [mode, setMode] = useState<GaitMode>('healthy');
  const [samples, setSamples] = useState<GaitSample[]>([]);
  const [generated, setGenerated] = useState(false);

  const generateReport = () => {
    let count = 0;
    const collected: GaitSample[] = [];

    const stop = createMockGaitStream(
      () => mode,
      (sample) => {
        collected.push(sample);
        count += 1;

        if (count >= 100) {
          stop();
          setSamples([...collected]);
          setGenerated(true);
        }
      },
    );
  };

  const metrics = useMemo(() => {
    if (!samples.length) return null;

    const angles = samples.map((sample) => sample.knee);
    const average = angles.reduce((sum, angle) => sum + angle, 0) / angles.length;
    const minimum = Math.min(...angles);
    const maximum = Math.max(...angles);
    const stance = samples.filter((sample) => sample.phase === 'stance').length;

    return {
      average,
      minimum,
      maximum,
      stancePercent: (stance / samples.length) * 100,
      swingPercent: 100 - (stance / samples.length) * 100,
      sampleCount: samples.length,
      duration: samples[samples.length - 1].t,
    };
  }, [samples]);

  const date = new Date().toLocaleString();

  const exportCSV = () => {
    if (!samples.length) return;

    const header = 'time_seconds,knee_flexion_deg,thigh_angle_deg,shank_angle_deg,gait_phase';
    const rows = samples.map((sample) =>
      [
        sample.t.toFixed(3),
        sample.knee.toFixed(2),
        sample.thigh.toFixed(2),
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
    link.download = 'kneegait-clinician-report-demo.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div>
          <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-teal-700">
            <FileText size={15} />
            Clinical documentation
          </div>

          <h1 className="text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
            Clinician Report
          </h1>

          <p className="mt-2 text-sm text-muted">
            Generate a structured report from a simulated gait session.
          </p>
        </div>

        <span className="w-fit rounded-full border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-800">
          DEMO · SIMULATED DATA
        </span>
      </header>

      <section className="rounded-xl border border-line bg-white p-5 shadow-sm">
        <h2 className="mb-4 font-semibold text-ink">Report configuration</h2>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1.5 block text-sm text-muted">Demo patient ID</span>
            <input
              value={patientId}
              onChange={(event) => setPatientId(event.target.value)}
              placeholder="DEMO-001"
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
            <span className="mb-1.5 block text-sm text-muted">Simulated gait profile</span>
            <select
              value={mode}
              onChange={(event) => {
                setMode(event.target.value as GaitMode);
                setGenerated(false);
              }}
              className="w-full rounded-lg border border-line bg-white px-3 py-2.5 text-sm text-ink outline-none focus:border-teal-600"
            >
              <option value="healthy">Healthy-like demo</option>
              <option value="stiff">Reduced-flexion demo</option>
            </select>
          </label>

          <label className="block sm:col-span-2">
            <span className="mb-1.5 block text-sm text-muted">Session notes (optional)</span>
            <textarea
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              rows={3}
              placeholder="Add observations for this demonstration..."
              className="w-full resize-y rounded-lg border border-line px-3 py-2.5 text-sm text-ink outline-none focus:border-teal-600"
            />
          </label>
        </div>

        <div className="mt-5 flex flex-wrap gap-3">
          <button
            onClick={generateReport}
            className="inline-flex items-center gap-2 rounded-lg bg-ink px-4 py-2.5 text-sm font-semibold text-white hover:opacity-90"
          >
            <Activity size={16} />
            Generate demo report
          </button>

          <button
            onClick={() => window.print()}
            disabled={!generated}
            className="inline-flex items-center gap-2 rounded-lg border border-line bg-white px-4 py-2.5 text-sm font-semibold text-ink hover:bg-paper disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Printer size={16} />
            Print / Save PDF
          </button>

          <button
            onClick={exportCSV}
            disabled={!generated}
            className="inline-flex items-center gap-2 rounded-lg border border-line bg-white px-4 py-2.5 text-sm font-semibold text-ink hover:bg-paper disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Download size={16} />
            Export CSV
          </button>
        </div>

        <p className="mt-3 text-xs text-muted">
          Report generation collects 100 synthetic samples locally in your browser.
        </p>
      </section>

      {generated && metrics && (
        <article className="report-document space-y-6 rounded-xl border border-line bg-white p-5 shadow-sm sm:p-8">
          <div className="flex flex-col justify-between gap-4 border-b border-line pb-5 sm:flex-row sm:items-start">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-teal-700">
                KneeGait-Edge
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-ink">
                Gait Session Report
              </h2>
              <p className="mt-1 text-sm text-muted">
                Wearable gait-monitoring prototype
              </p>
            </div>

            <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-800">
              SIMULATED REPORT
            </div>
          </div>

          <section className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex items-start gap-3">
              <UserRound size={18} className="mt-1 text-teal-700" />
              <div>
                <p className="text-xs text-muted">Demo patient ID</p>
                <p className="mt-1 font-semibold text-ink">{patientId || 'Not provided'}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <CalendarDays size={18} className="mt-1 text-teal-700" />
              <div>
                <p className="text-xs text-muted">Report generated</p>
                <p className="mt-1 font-semibold text-ink">{date}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Footprints size={18} className="mt-1 text-teal-700" />
              <div>
                <p className="text-xs text-muted">Session</p>
                <p className="mt-1 font-semibold text-ink">{sessionName || 'Unnamed session'}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Activity size={18} className="mt-1 text-teal-700" />
              <div>
                <p className="text-xs text-muted">Demo profile</p>
                <p className="mt-1 font-semibold text-ink">
                  {mode === 'healthy' ? 'Healthy-like' : 'Reduced flexion'}
                </p>
              </div>
            </div>
          </section>

          <section>
            <h3 className="mb-3 font-semibold text-ink">Session metrics</h3>

            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              {[
                ['Average knee flexion', `${metrics.average.toFixed(1)}°`],
                ['Peak knee flexion', `${metrics.maximum.toFixed(1)}°`],
                ['Minimum knee flexion', `${metrics.minimum.toFixed(1)}°`],
                ['Samples collected', `${metrics.sampleCount}`],
              ].map(([label, value]) => (
                <div key={label} className="rounded-lg border border-line bg-paper p-4">
                  <p className="text-xs leading-5 text-muted">{label}</p>
                  <p className="mt-2 text-2xl font-semibold text-ink">{value}</p>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h3 className="mb-3 font-semibold text-ink">Gait-phase distribution</h3>

            <div className="space-y-4">
              {[
                ['Stance', metrics.stancePercent],
                ['Swing', metrics.swingPercent],
              ].map(([label, value]) => (
                <div key={String(label)}>
                  <div className="mb-1.5 flex justify-between text-sm">
                    <span className="text-ink">{label} phase</span>
                    <span className="num text-muted">{Number(value).toFixed(1)}%</span>
                  </div>
                  <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-teal-600"
                      style={{ width: `${Number(value)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h3 className="mb-2 font-semibold text-ink">Technical observations</h3>
            <div className="rounded-lg border border-line p-4 text-sm leading-6 text-muted">
              {mode === 'healthy'
                ? 'The selected healthy-like profile uses the prototype’s synthetic knee-angle pattern. The displayed metrics describe only the generated samples.'
                : 'The selected reduced-flexion profile uses a lower synthetic peak angle than the healthy-like profile. This is a programmed demonstration scenario, not a finding about a real person.'}
            </div>
          </section>

          <section>
            <h3 className="mb-2 font-semibold text-ink">Session notes</h3>
            <p className="min-h-12 whitespace-pre-wrap rounded-lg border border-line p-4 text-sm leading-6 text-muted">
              {notes || 'No session notes were entered.'}
            </p>
          </section>

          <section className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900">
            <strong>Important limitation:</strong> This report uses synthetic browser-generated
            data. It is intended for software demonstration and development only. It is not a
            clinical assessment, diagnosis, or validated medical report. The prototype has not
            established clinical thresholds or patient-specific conclusions.
          </section>

          <footer className="border-t border-line pt-4 text-xs text-muted">
            KneeGait-Edge · Prototype report · No real sensor measurements included
          </footer>
        </article>
      )}
    </div>
  );
}
