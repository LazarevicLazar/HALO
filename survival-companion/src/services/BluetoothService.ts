// Define custom UUID for our application
// Using a custom UUID to ensure we only discover devices running our app
const SURVIVAL_APP_SERVICE_UUID = "00000000-0000-1000-8000-00805f9b34fb";

// Message types for Bluetooth communication
export enum MessageType {
  TRADE_REQUEST = "TRADE_REQUEST",
  TRADE_RESPONSE = "TRADE_RESPONSE",
  TRADE_OFFER = "TRADE_OFFER",
  TRADE_ACCEPT = "TRADE_ACCEPT",
  TRADE_REJECT = "TRADE_REJECT",
  TRADE_COMPLETE = "TRADE_COMPLETE",
  TRADE_CANCEL = "TRADE_CANCEL",
}

// Interface for Bluetooth messages
export interface BluetoothMessage {
  type: MessageType;
  payload: any;
}

export class BluetoothService {
  private device: BluetoothDevice | null = null;
  private server: BluetoothRemoteGATTServer | null = null;
  private characteristic: BluetoothRemoteGATTCharacteristic | null = null;
  private onMessageCallback: ((message: BluetoothMessage) => void) | null =
    null;
  private isConnected: boolean = false;

  // Check if Web Bluetooth API is supported
  isSupported(): boolean {
    return "bluetooth" in navigator;
  }

  // Scan for nearby devices running our app
  async scanForDevices(): Promise<BluetoothDevice> {
    if (!this.isSupported()) {
      throw new Error("Bluetooth is not supported on this device");
    }

    try {
      this.device = await navigator.bluetooth.requestDevice({
        filters: [{ services: [SURVIVAL_APP_SERVICE_UUID] }],
        optionalServices: [SURVIVAL_APP_SERVICE_UUID],
      });

      // Set up event listener for disconnection
      this.device.addEventListener(
        "gattserverdisconnected",
        this.onDisconnected.bind(this)
      );

      return this.device;
    } catch (error) {
      console.error("Error scanning for Bluetooth devices:", error);
      throw error;
    }
  }

  // Connect to a selected device
  async connect(device?: BluetoothDevice): Promise<void> {
    try {
      // Use provided device or the one from previous scan
      const targetDevice = device || this.device;

      if (!targetDevice) {
        throw new Error("No device selected");
      }

      this.device = targetDevice;

      // Connect to the GATT server
      if (this.device.gatt) {
        this.server = await this.device.gatt.connect();
      } else {
        throw new Error("GATT server not available");
      }

      if (!this.server) {
        throw new Error("Failed to connect to GATT server");
      }

      // Get the primary service
      const service = await this.server.getPrimaryService(
        SURVIVAL_APP_SERVICE_UUID
      );

      // Get the characteristic for reading/writing
      this.characteristic = await service.getCharacteristic(
        SURVIVAL_APP_SERVICE_UUID
      );

      // Start notifications to receive messages
      await this.characteristic.startNotifications();

      // Set up event listener for incoming messages
      this.characteristic.addEventListener(
        "characteristicvaluechanged",
        this.handleCharacteristicValueChanged.bind(this)
      );

      this.isConnected = true;
      console.log("Connected to device:", this.device.name || "Unknown device");
    } catch (error) {
      console.error("Error connecting to Bluetooth device:", error);
      this.disconnect();
      throw error;
    }
  }

  // Handle disconnection event
  private onDisconnected(event: Event): void {
    const device = event.target as BluetoothDevice;
    console.log(`Device ${device.name || "Unknown"} disconnected`);

    this.isConnected = false;
    this.server = null;
    this.characteristic = null;

    // You could add reconnection logic here if needed
  }

  // Handle incoming messages
  private handleCharacteristicValueChanged(event: Event): void {
    // Use a double cast to avoid TypeScript errors
    const characteristic =
      event.target as unknown as BluetoothRemoteGATTCharacteristic;
    const value = characteristic.value;

    if (value) {
      const decoder = new TextDecoder();
      const data = decoder.decode(value);

      try {
        const message = JSON.parse(data) as BluetoothMessage;

        if (this.onMessageCallback) {
          this.onMessageCallback(message);
        }
      } catch (error) {
        console.error("Error parsing Bluetooth message:", error);
      }
    }
  }

  // Send a message to the connected device
  async sendMessage(message: BluetoothMessage): Promise<void> {
    if (!this.isConnected || !this.characteristic) {
      throw new Error("Not connected to any device");
    }

    try {
      const encoder = new TextEncoder();
      const data = encoder.encode(JSON.stringify(message));
      await this.characteristic.writeValue(data);
    } catch (error) {
      console.error("Error sending message:", error);
      throw error;
    }
  }

  // Register a callback for incoming messages
  onMessage(callback: (message: BluetoothMessage) => void): void {
    this.onMessageCallback = callback;
  }

  // Disconnect from the current device
  disconnect(): void {
    if (this.device && this.device.gatt?.connected) {
      this.device.gatt.disconnect();
    }

    this.isConnected = false;
    this.device = null;
    this.server = null;
    this.characteristic = null;
    this.onMessageCallback = null;
  }

  // Check if currently connected
  isDeviceConnected(): boolean {
    return this.isConnected;
  }

  // Get the name of the connected device
  getConnectedDeviceName(): string {
    return this.device?.name || "Unknown device";
  }
}

// Create a singleton instance
const bluetoothService = new BluetoothService();
export default bluetoothService;
