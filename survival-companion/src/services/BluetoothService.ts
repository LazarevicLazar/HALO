// Define custom UUIDs for our application
// Using custom UUIDs to ensure we only discover devices running our app
// These are randomly generated UUIDs specifically for this application
const SURVIVAL_APP_SERVICE_UUID = "e20a39f4-73f5-4bc4-a12f-17d1ad07a961";
const SURVIVAL_APP_CHARACTERISTIC_UUID = "08590f7e-db05-467e-8757-72f6faeb13d4";

// Debug flag to enable verbose logging
const DEBUG = true;

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

    if (DEBUG) console.log("Starting Bluetooth device scan...");

    try {
      // Use a more flexible approach for discovery
      // 1. Try to find devices advertising our specific service
      // 2. If that fails, allow the user to select any Bluetooth device
      try {
        if (DEBUG) console.log("Attempting to find devices with our specific service UUID");
        this.device = await navigator.bluetooth.requestDevice({
          filters: [{ services: [SURVIVAL_APP_SERVICE_UUID] }],
          optionalServices: [SURVIVAL_APP_SERVICE_UUID],
        });
      } catch (initialError) {
        if (DEBUG) console.log("No devices found with our specific service. Trying a broader scan...", initialError);
        
        // If no devices with our specific service are found, try a broader approach
        // This will show all available Bluetooth devices to the user
        this.device = await navigator.bluetooth.requestDevice({
          acceptAllDevices: true,
          optionalServices: [SURVIVAL_APP_SERVICE_UUID]
        });
      }

      if (DEBUG) console.log("Device selected:", this.device.name || "Unknown device", this.device.id);

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
      
      if (DEBUG) console.log("Attempting to connect to device:", this.device.name || "Unknown device");

      // Connect to the GATT server
      if (!this.device.gatt) {
        throw new Error("GATT server not available");
      }
      
      try {
        this.server = await this.device.gatt.connect();
        if (DEBUG) console.log("GATT server connected successfully");
      } catch (gattError) {
        console.error("Error connecting to GATT server:", gattError);
        throw new Error(`GATT connection failed: ${gattError instanceof Error ? gattError.message : String(gattError)}`);
      }

      if (!this.server) {
        throw new Error("Failed to connect to GATT server");
      }

      // Try to get the primary service
      try {
        if (DEBUG) console.log("Attempting to get primary service with UUID:", SURVIVAL_APP_SERVICE_UUID);
        const service = await this.server.getPrimaryService(SURVIVAL_APP_SERVICE_UUID);
        if (DEBUG) console.log("Primary service obtained successfully");
        
        // Get the characteristic for reading/writing
        try {
          if (DEBUG) console.log("Attempting to get characteristic with UUID:", SURVIVAL_APP_CHARACTERISTIC_UUID);
          this.characteristic = await service.getCharacteristic(SURVIVAL_APP_CHARACTERISTIC_UUID);
          if (DEBUG) console.log("Characteristic obtained successfully");
          
          // Start notifications to receive messages
          try {
            await this.characteristic.startNotifications();
            if (DEBUG) console.log("Notifications started successfully");
            
            // Set up event listener for incoming messages
            this.characteristic.addEventListener(
              "characteristicvaluechanged",
              this.handleCharacteristicValueChanged.bind(this)
            );
            
            this.isConnected = true;
            console.log("Connected to device:", this.device.name || "Unknown device");
          } catch (notifyError) {
            console.error("Error starting notifications:", notifyError);
            throw new Error(`Failed to start notifications: ${notifyError instanceof Error ? notifyError.message : String(notifyError)}`);
          }
        } catch (charError) {
          console.error("Error getting characteristic:", charError);
          
          // If the characteristic doesn't exist, try to create it (this is a fallback and may not work in all browsers)
          if (DEBUG) console.log("Characteristic not found. This device may not be running our app.");
          throw new Error(`Characteristic not found: ${charError instanceof Error ? charError.message : String(charError)}`);
        }
      } catch (serviceError) {
        console.error("Error getting service:", serviceError);
        
        // If the service doesn't exist, try to create it (this is a fallback and may not work in all browsers)
        if (DEBUG) console.log("Service not found. This device may not be running our app.");
        throw new Error(`Service not found: ${serviceError instanceof Error ? serviceError.message : String(serviceError)}`);
      }
    } catch (error) {
      console.error("Error connecting to Bluetooth device:", error);
      this.disconnect();
      throw error;
    }
  }

  // Handle disconnection event
  private onDisconnected(event: Event): void {
    try {
      const device = event.target as BluetoothDevice;
      console.log(`Device ${device.name || "Unknown"} disconnected`);
      
      if (DEBUG) {
        console.log("Disconnection event details:", {
          deviceId: device.id,
          deviceName: device.name,
          wasConnected: this.isConnected
        });
      }
      
      this.isConnected = false;
      this.server = null;
      this.characteristic = null;
      
      // Notify any listeners about the disconnection
      if (this.onMessageCallback) {
        try {
          this.onMessageCallback({
            type: MessageType.TRADE_CANCEL,
            payload: {
              reason: "Device disconnected"
            }
          });
        } catch (callbackError) {
          console.error("Error in disconnect callback:", callbackError);
        }
      }
      
      // You could add reconnection logic here if needed
      // For example:
      // if (this.device && this.autoReconnect) {
      //   setTimeout(() => this.connect(this.device), 1000);
      // }
    } catch (error) {
      console.error("Error handling disconnection event:", error);
    }
  }

  // Handle incoming messages
  private handleCharacteristicValueChanged(event: Event): void {
    if (DEBUG) console.log("Characteristic value changed event received");
    
    try {
      // Use a double cast to avoid TypeScript errors
      const characteristic =
        event.target as unknown as BluetoothRemoteGATTCharacteristic;
      
      if (!characteristic) {
        console.error("Characteristic not found in event");
        return;
      }
      
      const value = characteristic.value;
      
      if (!value) {
        console.error("No value in characteristic");
        return;
      }
      
      if (DEBUG) console.log("Received raw data of length:", value.byteLength);
      
      const decoder = new TextDecoder();
      const data = decoder.decode(value);
      
      if (DEBUG) console.log("Decoded data:", data);
      
      try {
        const message = JSON.parse(data) as BluetoothMessage;
        
        if (DEBUG) console.log("Parsed message:", message);
        
        if (this.onMessageCallback) {
          if (DEBUG) console.log("Calling message callback");
          this.onMessageCallback(message);
        } else {
          if (DEBUG) console.log("No message callback registered");
        }
      } catch (error) {
        console.error("Error parsing Bluetooth message:", error);
        console.error("Raw data was:", data);
      }
    } catch (error) {
      console.error("Error handling characteristic value change:", error);
    }
  }

  // Send a message to the connected device
  async sendMessage(message: BluetoothMessage): Promise<void> {
    if (DEBUG) console.log("Attempting to send message:", message);
    
    if (!this.isConnected) {
      const error = new Error("Not connected to any device");
      console.error(error);
      throw error;
    }
    
    if (!this.characteristic) {
      const error = new Error("No characteristic available for writing");
      console.error(error);
      throw error;
    }

    try {
      const encoder = new TextEncoder();
      const jsonString = JSON.stringify(message);
      if (DEBUG) console.log("Serialized message:", jsonString);
      
      const data = encoder.encode(jsonString);
      if (DEBUG) console.log("Encoded data length:", data.length);
      
      if (DEBUG) console.log("Writing value to characteristic...");
      await this.characteristic.writeValue(data);
      if (DEBUG) console.log("Message sent successfully");
    } catch (error) {
      console.error("Error sending message:", error);
      console.error("Message that failed:", message);
      
      // Check if the error is related to disconnection
      if (error instanceof Error &&
          (error.message.includes("disconnected") ||
           error.message.includes("GATT operation failed"))) {
        console.log("Device appears to be disconnected, updating connection state");
        this.isConnected = false;
        this.server = null;
        this.characteristic = null;
      }
      
      throw error;
    }
  }

  // Register a callback for incoming messages
  onMessage(callback: (message: BluetoothMessage) => void): void {
    this.onMessageCallback = callback;
  }

  // Disconnect from the current device
  disconnect(): void {
    if (DEBUG) console.log("Disconnect method called");
    
    try {
      if (this.device && this.device.gatt) {
        if (DEBUG) console.log("Attempting to disconnect from device:", this.device.name || "Unknown device");
        
        if (this.device.gatt.connected) {
          if (DEBUG) console.log("Device is connected, disconnecting GATT");
          this.device.gatt.disconnect();
        } else {
          if (DEBUG) console.log("Device was already disconnected");
        }
      } else {
        if (DEBUG) console.log("No device or GATT to disconnect");
      }
    } catch (error) {
      console.error("Error during disconnect:", error);
    } finally {
      // Always clean up resources regardless of errors
      if (DEBUG) console.log("Cleaning up Bluetooth resources");
      this.isConnected = false;
      this.device = null;
      this.server = null;
      this.characteristic = null;
      
      // Keep the callback in case we want to notify about disconnection
      // Only clear it if explicitly requested
      this.onMessageCallback = null;
    }
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
