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

export interface BleGaitSample {
  t: number;      // timestamp in seconds
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
  private currentPhase: Phase = 'stance';
  private packetCounter = 0;

  async requestAndConnect(
    onSample: (sample: BleGaitSample, rawPacketCount: number) => void,
    onStatusChange: (status: BleStatus, errorMsg?: string) => void
  ): Promise<void> {
    const nav = typeof navigator !== 'undefined' ? (navigator as unknown as NavigatorWithBluetooth) : null;
    if (!nav?.bluetooth) {
      const err = 'Web Bluetooth API is not available in this browser. Please use Google Chrome, Microsoft Edge, or Opera on desktop or Android.';
      onStatusChange('error', err);
      throw new Error(err);
    }

    try {
      onStatusChange('connecting');

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
    // Format is typically: "timestamp_ms,knee_angle,angular_velocity"
    // e.g.: "57459,18.42,-0.16"
    const parts = line.split(',');
    if (parts.length < 2) return null;

    const rawMs = parseFloat(parts[0]);
    const kneeAngle = parseFloat(parts[1]);
    const angularVel = parts.length > 2 ? parseFloat(parts[2]) : 0;

    if (isNaN(kneeAngle)) return null;

    const nowSec = !isNaN(rawMs) && rawMs > 0 ? rawMs / 1000 : Date.now() / 1000;
    if (this.startTime === null) {
      this.startTime = nowSec;
    }

    const t = nowSec - this.startTime;

    // Determine gait phase dynamically based on angle and angular velocity:
    // Stance phase is lower flexion angle (< 20°); swing phase peaks during forward step (> 20° or high gyro)
    if (kneeAngle > 20 || (kneeAngle > 12 && angularVel > 25)) {
      this.currentPhase = 'swing';
    } else if (kneeAngle <= 14 && angularVel < 5) {
      this.currentPhase = 'stance';
    }

    // Relative segment orientation
    const thigh = 7.5 + (kneeAngle * 0.45);
    const shank = thigh - kneeAngle;

    return {
      t,
      knee: Math.max(0, kneeAngle),
      thigh,
      shank,
      gyro: angularVel,
      phase: this.currentPhase,
    };
  }
}

export const bleService = new BleService();
