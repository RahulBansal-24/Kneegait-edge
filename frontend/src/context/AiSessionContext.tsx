import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { useBle } from './BleContext';
import {
  GaitFeatureExtractor,
  WindowFeatureResult,
} from '../lib/ai/gaitFeatureExtractor';
import {
  CLASS_DESCRIPTIONS,
  CLASS_DISPLAY_LABELS,
  CLASS_NAMES,
  ClassName,
  InferenceResult,
  runInference,
} from '../lib/ai/modelInference';

export interface WindowPredictionLog {
  windowNumber: number; // 1 to 6
  timeInterval: string; // e.g. "00:00 – 00:30"
  timestamp: string;    // e.g. "16:04:12"
  isValid: boolean;
  statusMessage: string;
  sampleCount: number;
  strideCount: number;
  features: [number, number, number, number, number];
  predictedClassId: number;
  predictedClassName: ClassName;
  predictedDisplayLabel: string;
  probabilities: [number, number, number];
  confidence: number;
  description: string;
}

export interface ConsolidatedAiResult {
  finalClassId: number;
  finalClassName: ClassName;
  finalDisplayLabel: string;
  finalDescription: string;
  aggregateProbabilities: [number, number, number];
  overallConfidence: number;
  validWindowCount: number;
  totalWindows: number;
  totalDurationSec: number;
  completedAt: string;
  windowSummaries: WindowPredictionLog[];
  disclaimer: string;
}

export type AiSessionStatus =
  | 'idle'
  | 'ready'
  | 'running'
  | 'completed'
  | 'interrupted';

interface AiSessionContextValue {
  status: AiSessionStatus;
  statusMessage: string;
  elapsedSeconds: number;
  currentWindowIndex: number; // 1 to 6
  windowSecondsRemaining: number;
  logs: WindowPredictionLog[];
  finalResult: ConsolidatedAiResult | null;
  showCompletionModal: boolean;
  startSession: () => void;
  stopSession: () => void;
  resetSession: () => void;
  dismissCompletionModal: () => void;
}

const TOTAL_SESSION_SECONDS = 180; // 3 minutes
const WINDOW_DURATION_SECONDS = 30; // 6 windows
const TOTAL_WINDOWS = 6;

const AiSessionContext = createContext<AiSessionContextValue | null>(null);

export function AiSessionProvider({ children }: { children: React.ReactNode }) {
  const { status: bleStatus, subscribe } = useBle();
  const isBleConnected = bleStatus === 'connected';

  const [status, setStatus] = useState<AiSessionStatus>('idle');
  const [statusMessage, setStatusMessage] = useState<string>(
    'Connect wearable and click "Start 3-Minute Assessment" to begin local AI analysis.'
  );
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [currentWindowIndex, setCurrentWindowIndex] = useState(1);
  const [windowSecondsRemaining, setWindowSecondsRemaining] = useState(30);
  const [logs, setLogs] = useState<WindowPredictionLog[]>([]);
  const [finalResult, setFinalResult] = useState<ConsolidatedAiResult | null>(null);
  const [showCompletionModal, setShowCompletionModal] = useState(false);

  const featureExtractorRef = useRef(new GaitFeatureExtractor());
  const timerRef = useRef<number | null>(null);
  const sessionActiveRef = useRef(false);

  // Update status message when connection state changes and idle
  useEffect(() => {
    if (status === 'idle') {
      if (isBleConnected) {
        setStatusMessage('Wearable connected at 50Hz. Ready to start 3-minute AI analysis.');
      } else {
        setStatusMessage('Connect wearable to enable local AI inference session.');
      }
    }
  }, [isBleConnected, status]);

  // Handle unexpected disconnect during active analysis
  useEffect(() => {
    if (status === 'running' && !isBleConnected) {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      sessionActiveRef.current = false;
      setStatus('interrupted');
      setStatusMessage('BLE connection interrupted. Analysis stopped prematurely.');
    }
  }, [isBleConnected, status]);

  // Subscribe directly to 50Hz incoming BLE samples without polling
  useEffect(() => {
    if (status !== 'running') return;

    const unsubscribe = subscribe((sample) => {
      featureExtractorRef.current.ingestSample({
        t: sample.t,
        knee: sample.knee,
        gyro: sample.gyro,
      });
    });

    return unsubscribe;
  }, [status, subscribe]);

  /**
   * Evaluates the completed 30-second window and executes local model inference.
   */
  const processWindow = useCallback(
    (winIdx: number): WindowPredictionLog => {
      const windowStartSec = (winIdx - 1) * WINDOW_DURATION_SECONDS;
      const windowEndSec = winIdx * WINDOW_DURATION_SECONDS;
      const timeInterval = `${formatTime(windowStartSec)} – ${formatTime(windowEndSec)}`;
      const timestamp = new Date().toLocaleTimeString();

      const featureResult: WindowFeatureResult =
        featureExtractorRef.current.finalizeWindow();

      // Reset extractor for the next window immediately so no incoming samples are lost
      featureExtractorRef.current.startNewWindow();

      if (!featureResult.isValid) {
        // Incomplete window
        return {
          windowNumber: winIdx,
          timeInterval,
          timestamp,
          isValid: false,
          statusMessage: featureResult.statusMessage,
          sampleCount: featureResult.sampleCount,
          strideCount: featureResult.strideCount,
          features: [0, 0, 0, 0, 0],
          predictedClassId: -1,
          predictedClassName: 'NORMAL_GAIT',
          predictedDisplayLabel: 'Incomplete / Degraded',
          probabilities: [0, 0, 0],
          confidence: 0,
          description: featureResult.statusMessage,
        };
      }

      // Execute local Random Forest model inference
      const inference: InferenceResult = runInference(featureResult.features);

      return {
        windowNumber: winIdx,
        timeInterval,
        timestamp,
        isValid: true,
        statusMessage: featureResult.statusMessage,
        sampleCount: featureResult.sampleCount,
        strideCount: featureResult.strideCount,
        features: featureResult.features,
        predictedClassId: inference.classId,
        predictedClassName: inference.className,
        predictedDisplayLabel: inference.displayLabel,
        probabilities: inference.probabilities,
        confidence: inference.confidence,
        description: inference.description,
      };
    },
    []
  );

  /**
   * Finalizes the complete 3-minute session, consolidating all 6 predictions.
   */
  const consolidateSession = useCallback((windowLogs: WindowPredictionLog[]) => {
    const validLogs = windowLogs.filter((w) => w.isValid);
    const validCount = validLogs.length;

    if (validCount === 0) {
      setStatus('interrupted');
      setStatusMessage('Analysis finished with 0 valid windows. Insufficient sensor data collected.');
      return;
    }

    // Mathematical aggregation: compute average probability for each class across valid windows
    const aggProb: [number, number, number] = [0, 0, 0];
    for (const log of validLogs) {
      aggProb[0] += log.probabilities[0];
      aggProb[1] += log.probabilities[1];
      aggProb[2] += log.probabilities[2];
    }
    aggProb[0] /= validCount;
    aggProb[1] /= validCount;
    aggProb[2] /= validCount;

    // Final predicted class is argmax of average probabilities
    let finalClass = 0;
    let maxP = aggProb[0];
    for (let c = 1; c < 3; c++) {
      if (aggProb[c] > maxP) {
        maxP = aggProb[c];
        finalClass = c;
      }
    }

    const overallConfidence = Math.round(aggProb[finalClass] * 100);

    const consolidated: ConsolidatedAiResult = {
      finalClassId: finalClass,
      finalClassName: CLASS_NAMES[finalClass],
      finalDisplayLabel: CLASS_DISPLAY_LABELS[finalClass],
      finalDescription: CLASS_DESCRIPTIONS[finalClass],
      aggregateProbabilities: aggProb,
      overallConfidence,
      validWindowCount: validCount,
      totalWindows: TOTAL_WINDOWS,
      totalDurationSec: TOTAL_SESSION_SECONDS,
      completedAt: new Date().toLocaleTimeString(),
      windowSummaries: [...windowLogs],
      disclaimer:
        'Experimental gait-pattern classification prototype trained on biomechanical thresholds. For research and clinical exploration; not a certified diagnostic device.',
    };

    setFinalResult(consolidated);
    setStatus('completed');
    setStatusMessage(
      `3-minute AI analysis completed. Consolidated outcome: ${consolidated.finalDisplayLabel} (${overallConfidence}% confidence across ${validCount}/${TOTAL_WINDOWS} windows).`
    );
    setShowCompletionModal(true);
  }, []);

  /**
   * Starts the 3-minute AI analysis session.
   */
  const startSession = useCallback(() => {
    if (!isBleConnected) {
      setStatusMessage('Please connect your ESP32 wearable via Bluetooth before starting analysis.');
      return;
    }

    // Reset session state
    if (timerRef.current) clearInterval(timerRef.current);
    sessionActiveRef.current = true;
    featureExtractorRef.current = new GaitFeatureExtractor();
    featureExtractorRef.current.startNewWindow();

    setLogs([]);
    setFinalResult(null);
    setShowCompletionModal(false);
    setElapsedSeconds(0);
    setCurrentWindowIndex(1);
    setWindowSecondsRemaining(WINDOW_DURATION_SECONDS);
    setStatus('running');
    setStatusMessage('Analysis running: Window 1 of 6. Walking continuously at normal pace…');

    let currentElapsed = 0;
    let currentLogs: WindowPredictionLog[] = [];

    timerRef.current = window.setInterval(() => {
      if (!sessionActiveRef.current) return;

      currentElapsed += 1;
      setElapsedSeconds(currentElapsed);

      const winIdx = Math.min(TOTAL_WINDOWS, Math.floor(currentElapsed / WINDOW_DURATION_SECONDS) + 1);
      const remainingInWin = WINDOW_DURATION_SECONDS - (currentElapsed % WINDOW_DURATION_SECONDS || WINDOW_DURATION_SECONDS);

      setCurrentWindowIndex(winIdx);
      setWindowSecondsRemaining(remainingInWin === 0 ? WINDOW_DURATION_SECONDS : remainingInWin);

      // Check if a 30-second window just completed
      if (currentElapsed % WINDOW_DURATION_SECONDS === 0 && currentElapsed <= TOTAL_SESSION_SECONDS) {
        const completedWinIdx = currentElapsed / WINDOW_DURATION_SECONDS;
        const newLog = processWindow(completedWinIdx);
        currentLogs = [...currentLogs, newLog];
        setLogs([...currentLogs]);

        if (completedWinIdx < TOTAL_WINDOWS) {
          setStatusMessage(
            `Window ${completedWinIdx} complete (${newLog.predictedDisplayLabel}). Collecting Window ${completedWinIdx + 1} of 6…`
          );
        }
      }

      // Check if the entire 3-minute session (180s) has completed
      if (currentElapsed >= TOTAL_SESSION_SECONDS) {
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
        sessionActiveRef.current = false;
        consolidateSession(currentLogs);
      }
    }, 1000);
  }, [consolidateSession, isBleConnected, processWindow]);

  /**
   * Stops an in-progress session early without fabricating a false final result.
   */
  const stopSession = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    sessionActiveRef.current = false;
    setStatus('interrupted');
    setStatusMessage('Session stopped by user before completing 3 minutes. Incomplete session discarded.');
  }, []);

  /**
   * Resets the entire session back to idle.
   */
  const resetSession = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    sessionActiveRef.current = false;
    featureExtractorRef.current = new GaitFeatureExtractor();
    setLogs([]);
    setFinalResult(null);
    setShowCompletionModal(false);
    setElapsedSeconds(0);
    setCurrentWindowIndex(1);
    setWindowSecondsRemaining(WINDOW_DURATION_SECONDS);
    setStatus('idle');
    setStatusMessage(
      isBleConnected
        ? 'Wearable connected at 50Hz. Ready to start 3-minute AI analysis.'
        : 'Connect wearable and click "Start 3-Minute Assessment" to begin local AI analysis.'
    );
  }, [isBleConnected]);

  const dismissCompletionModal = useCallback(() => {
    setShowCompletionModal(false);
  }, []);

  return (
    <AiSessionContext.Provider
      value={{
        status,
        statusMessage,
        elapsedSeconds,
        currentWindowIndex,
        windowSecondsRemaining,
        logs,
        finalResult,
        showCompletionModal,
        startSession,
        stopSession,
        resetSession,
        dismissCompletionModal,
      }}
    >
      {children}
    </AiSessionContext.Provider>
  );
}

export function useAiSession() {
  const context = useContext(AiSessionContext);
  if (!context) {
    throw new Error('useAiSession must be used within an AiSessionProvider');
  }
  return context;
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}
