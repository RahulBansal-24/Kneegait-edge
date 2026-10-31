// Web Bluetooth service manager for KneeGait-Edge ESP32 GATT server.

interface BluetoothRemoteGATTServer {
  connected: boolean;
  connect(): Promise<BluetoothRemoteGATTServer>;
  disconnect(): void;
  getPrimaryService(service: string): Promise<BluetoothRemoteGATTService>;
}

interface BluetoothRemoteGATTService {
  getCharacteristic(characteristic: string): Promise<BluetoothRemoteGATTCharacteristic>;
}

interface BluetoothRemoteGATTCharacteristic extends EventTarget {
  value?: DataView;
  startNotifications(): Promise<BluetoothRemoteGATTCharacteristic>;
  stopNotifications(): Promise<BluetoothRemoteGATTCharacteristic>;
  addEventListener(type: string, listener: EventListenerOrEventListenerObject): void;
}

interface BluetoothDevice extends EventTarget {
  id: string;
  name?: string;
  gatt?: BluetoothRemoteGATTServer;
  addEventListener(type: string, listener: EventListenerOrEventListenerObject): void;
}

interface NavigatorWithBluetooth {
  bluetooth?: {
    requestDevice(options: any): Promise<BluetoothDevice>;
  };
}

export const BLE_CONFIG = {
  deviceName: 'KneeGait-Edge',
  serviceUuid: '4fafc201-1fb5-459e-8fcc-c5c9c331914b',
  charUuid: 'beb5483e-36e1-4688-b7f5-ea07361b26a8',
} as const;

export type Phase = 'stance' | 'swing';

export interface StrideFeature {
  peak: number;
  rom: number;
  ratio: number;
  vel: number;
  cadence: number;
}

export interface BleGaitSample {
  t: number;      // timestamp in seconds (monotonic)
  knee: number;   // knee flexion angle in degrees
  thigh: number;  // estimated/measured thigh angle in degrees
  shank: number;  // estimated/measured shank angle in degrees
  gyro: number;   // angular velocity in deg/s
  phase: Phase;
}

export type BleStatus = 'disconnected' | 'connecting' | 'connected' | 'error';

export class BleService {
  private device: BluetoothDevice | null = null;
  private server: BluetoothRemoteGATTServer | null = null;
  private characteristic: BluetoothRemoteGATTCharacteristic | null = null;
  private decoder = new TextDecoder();
  private buffer = '';
  private startTime: number | null = null;
  private lastT: number | null = null;
  private currentPhase: Phase = 'stance';
  private packetCounter = 0;
  private onStrideCallback?: (stride: StrideFeature) => void;

  async requestAndConnect(
    onSample: (sample: BleGaitSample, rawPacketCount: number) => void,
    onStatusChange: (status: BleStatus, errorMsg?: string) => void,
    onStride?: (stride: StrideFeature) => void
  ): Promise<void> {
    const nav = typeof navigator !== 'undefined' ? (navigator as unknown as NavigatorWithBluetooth) : null;
    if (!nav?.bluetooth) {
      const err = 'Web Bluetooth API is not available in this browser. Please use Google Chrome, Microsoft Edge, or Opera on desktop or Android.';
      onStatusChange('error', err);
      throw new Error(err);
    }

    try {
      onStatusChange('connecting');
      this.onStrideCallback = onStride;

      // Request device with primary service filter or acceptAllDevices fallback
      let requestedDevice: BluetoothDevice;
      try {
        requestedDevice = await nav.bluetooth.requestDevice({
          filters: [
            { name: BLE_CONFIG.deviceName },
            { namePrefix: 'KneeGait' },
          ],
          optionalServices: [BLE_CONFIG.serviceUuid],
        });
      } catch {
        // Fallback: allow user to select any device advertising the GATT service
        requestedDevice = await nav.bluetooth.requestDevice({
          acceptAllDevices: true,
          optionalServices: [BLE_CONFIG.serviceUuid],
        });
      }

      this.device = requestedDevice;

      // Handle spontaneous disconnect (device turned off / out of range)
      this.device.addEventListener('gattserverdisconnected', () => {
        this.characteristic = null;
        this.server = null;
        onStatusChange('disconnected');
      });

      // Connect to GATT Server
      const server = await this.device.gatt?.connect();
      if (!server) {
        throw new Error('Failed to establish connection with ESP32 GATT server.');
      }
      this.server = server;

      // Discover custom Service
      const service = await server.getPrimaryService(BLE_CONFIG.serviceUuid);

      // Discover Notification Characteristic
      const char = await service.getCharacteristic(BLE_CONFIG.charUuid);
      this.characteristic = char;

      // Subscribe to 50Hz notifications
      await char.startNotifications();
      this.packetCounter = 0;
      this.buffer = '';
      this.startTime = null;
      this.lastT = null;

      char.addEventListener('characteristicvaluechanged', (event: Event) => {
        const target = event.target as unknown as { value: DataView };
        if (!target?.value) return;

        const raw = this.decoder.decode(target.value);
        this.buffer += raw;

        const lines = this.buffer.split('\n');
        // Retain the last incomplete chunk in the buffer
        this.buffer = lines.pop() ?? '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed) continue;

          // 1. Check for firmware stride broadcast: #STRIDE,peak,rom,ratio,vel,cadence
          if (trimmed.startsWith('#STRIDE')) {
            const parts = trimmed.split(',');
            if (parts.length >= 6) {
              const peak = parseFloat(parts[1]);
              const rom = parseFloat(parts[2]);
              const ratio = parseFloat(parts[3]);
              const vel = parseFloat(parts[4]);
              const cadence = parseFloat(parts[5]);
              if (!isNaN(peak) && !isNaN(rom)) {
                this.onStrideCallback?.({ peak, rom, ratio, vel, cadence });
              }
            }
            continue;
          }

          // Ignore comments or debug lines
          if (trimmed.startsWith('#') || trimmed.startsWith('>') || trimmed.startsWith('[')) {
            continue;
          }

          this.packetCounter += 1;
          const parsed = this.parseLine(trimmed);
          if (parsed) {
            onSample(parsed, this.packetCounter);
          }
        }
      });

      onStatusChange('connected');
    } catch (err: any) {
      if (err.name === 'NotFoundError') {
        // User cancelled the Bluetooth picker dialog
        onStatusChange('disconnected');
        return;
      }
      onStatusChange('error', err.message || 'Bluetooth connection failed');
      throw err;
    }
  }

  disconnect() {
    try {
      if (this.characteristic) {
        this.characteristic.stopNotifications().catch(() => {});
      }
      if (this.device?.gatt?.connected) {
        this.device.gatt.disconnect();
      }
    } finally {
      this.device = null;
      this.server = null;
      this.characteristic = null;
      this.packetCounter = 0;
      this.startTime = null;
      this.lastT = null;
      this.onStrideCallback = undefined;
    }
  }

  get isConnected(): boolean {
    return !!(this.device?.gatt?.connected);
  }

  get deviceName(): string {
    return this.device?.name || BLE_CONFIG.deviceName;
  }

  get packets(): number {
    return this.packetCounter;
  }

  private parseLine(line: string): BleGaitSample | null {
    const parts = line.split(',');
    if (parts.length < 1) return null;

    let kneeAngle = 0;
    let angularVel = 0;
    let thigh = 0;
    let shank = 0;

    if (parts.length >= 3) {
      const v0 = parseFloat(parts[0]);
      const v1 = parseFloat(parts[1]);
      const v2 = parseFloat(parts[2]);

      // Check if parts[0] is ESP32 timestamp in milliseconds (Esp32.ino: "%lu,%.2f,%.2f")
      if (v0 > 500 && (v0 > 1000 || Number.isInteger(v0)) && Math.abs(v1) <= 180) {
        kneeAngle = v1;
        angularVel = v2;
        thigh = 7.5 + (kneeAngle * 0.45);
        shank = thigh - kneeAngle;
      } else {
        // Documented format: thigh, shank, knee
        thigh = v0;
        shank = v1;
        kneeAngle = !isNaN(v2) ? v2 : Math.abs(thigh - shank);
        angularVel = 0;
      }
    } else if (parts.length === 2) {
      // 2 parts: knee_angle, angular_velocity
      kneeAngle = parseFloat(parts[0]);
      angularVel = parseFloat(parts[1]);
      thigh = 7.5 + (kneeAngle * 0.45);
      shank = thigh - kneeAngle;
    } else if (parts.length === 1) {
      kneeAngle = parseFloat(parts[0]);
      thigh = 7.5 + (kneeAngle * 0.45);
      shank = thigh - kneeAngle;
    }

    if (isNaN(kneeAngle)) return null;

    // Strict local monotonic timestamping (avoids epoch drift, clock wrap, and duplicate packet collisions)
    const localNowSec = (typeof performance !== 'undefined' ? performance.now() : Date.now()) / 1000;
    if (this.startTime === null) {
      this.startTime = localNowSec;
    }

    let t = localNowSec - this.startTime;
    if (this.lastT !== null && t <= this.lastT) {
      t = this.lastT + 0.002;
    }
    this.lastT = t;

    // Determine gait phase dynamically based on angle and angular velocity
    if (kneeAngle > 20 || (kneeAngle > 12 && angularVel > 25)) {
      this.currentPhase = 'swing';
    } else if (kneeAngle <= 14 && angularVel < 5) {
      this.currentPhase = 'stance';
    }

    return {
      t,
      knee: Math.max(0, kneeAngle),
      thigh,
      shank,
      gyro: isNaN(angularVel) ? 0 : angularVel,
      phase: this.currentPhase,
    };
  }
}

export const bleService = new BleService();
