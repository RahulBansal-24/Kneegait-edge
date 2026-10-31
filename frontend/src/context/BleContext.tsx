import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { bleService, BleGaitSample, BleStatus, Phase } from '../lib/bleService';
import { THRESHOLDS } from '../lib/thresholds';

export interface GaitMetrics {
  knee: number;
  phase: Phase;
  lastPeak: number | null;
  rom: number;
  cadence: number | null;
}

export interface TelemetryData {
  angle: number;
  thighGyro: number;
  shankGyro: number;
  accelX: number;
  accelY: number;
  accelZ: number;
  packets: number;
}

interface BleContextValue {
  status: BleStatus;
  errorMessage: string | null;
  deviceName: string;
  packetCount: number;
  metrics: GaitMetrics;
  telemetry: TelemetryData;
  buffer: React.MutableRefObject<BleGaitSample[]>;
  connect: () => Promise<void>;
  disconnect: () => void;
  logs: string[];
}

const initialMetrics: GaitMetrics = {
  knee: 0,
  phase: 'stance',
  lastPeak: null,
  rom: 0,
  cadence: null,
};

const initialTelemetry: TelemetryData = {
  angle: 0,
  thighGyro: 0,
  shankGyro: 0,
  accelX: 0,
  accelY: 0,
  accelZ: 9.81,
  packets: 0,
};

const BleContext = createContext<BleContextValue | null>(null);

export function BleProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<BleStatus>('disconnected');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [packetCount, setPacketCount] = useState(0);
  const [metrics, setMetrics] = useState<GaitMetrics>(initialMetrics);
  const [telemetry, setTelemetry] = useState<TelemetryData>(initialTelemetry);
  const [logs, setLogs] = useState<string[]>([
    'Bluetooth interface ready.',
    'Click Connect to pair with ESP32 wearable.',
  ]);

  const buffer = useRef<BleGaitSample[]>([]);
  const maxLen = THRESHOLDS.strideWindowSec * THRESHOLDS.sampleRateHz;

  // Gait feature tracking variables
  const swingMaxRef = useRef(0);
  const lastPeakRef = useRef<number | null>(null);
  const lastStrikeRef = useRef<number | null>(null);
  const cadenceRef = useRef<number | null>(null);
  const prevPhaseRef = useRef<Phase>('stance');
  const sampleCounter = useRef(0);

  const addLog = (msg: string) => {
    const time = new Date().toLocaleTimeString();
    setLogs((prev) => [`${time}  ${msg}`, ...prev].slice(0, 10));
  };

  const connect = async () => {
    setErrorMessage(null);
    addLog('Requesting Bluetooth device pairing…');

    try {
      await bleService.requestAndConnect(
        (sample, rawPacketCount) => {
          // Push sample to waveform buffer
          const buf = buffer.current;
          buf.push(sample);
          if (buf.length > maxLen) buf.shift();

          // Gait segmentation
          if (sample.phase === 'swing') {
            swingMaxRef.current = Math.max(swingMaxRef.current, sample.knee);
          }
          if (prevPhaseRef.current === 'swing' && sample.phase === 'stance') {
            // Heel strike detected
            lastPeakRef.current = swingMaxRef.current;
            swingMaxRef.current = 0;
            if (lastStrikeRef.current !== null && sample.t > lastStrikeRef.current) {
              const dt = sample.t - lastStrikeRef.current;
              if (dt > 0.4 && dt < 2.5) {
                cadenceRef.current = Math.round(120 / dt);
              }
            }
            lastStrikeRef.current = sample.t;
          }
          prevPhaseRef.current = sample.phase;

          sampleCounter.current += 1;

          // Throttle React state updates to ~10Hz to maintain 60fps UI performance
          if (sampleCounter.current % 5 === 0) {
            let lo = Infinity;
            let hi = -Infinity;
            for (const s of buf) {
              if (s.knee < lo) lo = s.knee;
              if (s.knee > hi) hi = s.knee;
            }
            const rom = isFinite(hi) && isFinite(lo) ? Math.max(0, hi - lo) : 0;

            setMetrics({
              knee: sample.knee,
              phase: sample.phase,
              lastPeak: lastPeakRef.current,
              rom,
              cadence: cadenceRef.current,
            });

            setTelemetry({
              angle: sample.knee,
              thighGyro: sample.gyro,
              shankGyro: -sample.gyro * 0.8,
              accelX: 0.12,
              accelY: -0.04,
              accelZ: 9.8,
              packets: rawPacketCount,
            });

            setPacketCount(rawPacketCount);
          }
        },
        (newStatus, errorMsg) => {
          setStatus(newStatus);
          if (newStatus === 'connected') {
            addLog(`Connected to ${bleService.deviceName}. Receiving 50Hz telemetry.`);
          } else if (newStatus === 'disconnected') {
            addLog('Device disconnected.');
          } else if (newStatus === 'error') {
            setErrorMessage(errorMsg || 'Bluetooth error');
            addLog(`Error: ${errorMsg || 'Connection failed'}`);
          }
        }
      );
    } catch (e: any) {
      // Error already handled in callback
    }
  };

  const disconnect = () => {
    bleService.disconnect();
    setStatus('disconnected');
    setMetrics(initialMetrics);
    setTelemetry(initialTelemetry);
    buffer.current = [];
    addLog('Disconnected by user.');
  };

  useEffect(() => {
    return () => {
      bleService.disconnect();
    };
  }, []);

  return (
    <BleContext.Provider
      value={{
        status,
        errorMessage,
        deviceName: bleService.deviceName,
        packetCount,
        metrics,
        telemetry,
        buffer,
        connect,
        disconnect,
        logs,
      }}
    >
      {children}
    </BleContext.Provider>
  );
}

export function useBle() {
  const ctx = useContext(BleContext);
  if (!ctx) {
    throw new Error('useBle must be used within a BleProvider');
  }
  return ctx;
}
