import React, {
  createContext,
  useState,
  useContext,
  ReactNode,
  useEffect,
} from "react";
import mockNPCs, { NPC } from "../data/mockNPCs";
import { InventoryItem } from "../data/mockInventory";
import { InventoryContext } from "./InventoryContext";
import { CompanionContext } from "./CompanionContext";
import { TradeLogContext } from "./TradeLogContext";
import bluetoothService, {
  BluetoothMessage,
  MessageType,
} from "../services/BluetoothService";

// Define Bluetooth trading interfaces
interface BluetoothTradeRequest {
  requestId: string;
  fromName: string;
}

interface BluetoothTradeOffer {
  requestId: string;
  fromName: string;
  items: InventoryItem[];
}

interface BarterContextType {
  npcs: NPC[];
  selectedNPC: NPC | null;
  playerOffers: InventoryItem[];
  npcOffers: InventoryItem[];

  // Bluetooth trading state
  isBluetoothSupported: boolean;
  isScanning: boolean;
  isConnected: boolean;
  connectedDeviceName: string | null;
  incomingTradeRequest: BluetoothTradeRequest | null;
  incomingTradeOffer: BluetoothTradeOffer | null;

  // NPC trading methods
  selectNPC: (npc: NPC | null) => void;
  addToPlayerOffer: (item: InventoryItem) => void;
  removeFromPlayerOffer: (itemId: string) => void;
  addToNPCOffer: (item: InventoryItem) => void;
  removeFromNPCOffer: (itemId: string) => void;
  executeTrade: () => void;
  clearOffers: () => void;

  // Bluetooth trading methods
  scanForDevices: () => Promise<void>;
  connectToDevice: (deviceId: string) => Promise<void>;
  disconnectDevice: () => void;
  sendTradeRequest: () => Promise<void>;
  acceptTradeRequest: () => Promise<void>;
  rejectTradeRequest: () => void;
  sendTradeOffer: () => Promise<void>;
  acceptTradeOffer: () => Promise<void>;
  rejectTradeOffer: () => void;
}

export const BarterContext = createContext<BarterContextType>({
  npcs: [],
  selectedNPC: null,
  playerOffers: [],
  npcOffers: [],

  // Bluetooth trading state
  isBluetoothSupported: false,
  isScanning: false,
  isConnected: false,
  connectedDeviceName: null,
  incomingTradeRequest: null,
  incomingTradeOffer: null,

  // NPC trading methods
  selectNPC: () => {},
  addToPlayerOffer: () => {},
  removeFromPlayerOffer: () => {},
  addToNPCOffer: () => {},
  removeFromNPCOffer: () => {},
  executeTrade: () => {},
  clearOffers: () => {},

  // Bluetooth trading methods
  scanForDevices: async () => {},
  connectToDevice: async () => {},
  disconnectDevice: () => {},
  sendTradeRequest: async () => {},
  acceptTradeRequest: async () => {},
  rejectTradeRequest: () => {},
  sendTradeOffer: async () => {},
  acceptTradeOffer: async () => {},
  rejectTradeOffer: () => {},
});

interface BarterProviderProps {
  children: ReactNode;
}

export const BarterProvider: React.FC<BarterProviderProps> = ({ children }) => {
  // NPC trading state
  const [npcs, setNpcs] = useState<NPC[]>(mockNPCs);
  const [selectedNPC, setSelectedNPC] = useState<NPC | null>(null);
  const [playerOffers, setPlayerOffers] = useState<InventoryItem[]>([]);
  const [npcOffers, setNpcOffers] = useState<InventoryItem[]>([]);

  // Bluetooth trading state
  const [isBluetoothSupported, setIsBluetoothSupported] =
    useState<boolean>(false);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [connectedDeviceName, setConnectedDeviceName] = useState<string | null>(
    null
  );
  const [incomingTradeRequest, setIncomingTradeRequest] =
    useState<BluetoothTradeRequest | null>(null);
  const [incomingTradeOffer, setIncomingTradeOffer] =
    useState<BluetoothTradeOffer | null>(null);
  const [currentTradeId, setCurrentTradeId] = useState<string | null>(null);

  const { inventory, updateItemQuantity, addItem } =
    useContext(InventoryContext);
  const { triggerCompanionResponse } = useContext(CompanionContext);
  const tradeLogContext = useContext(TradeLogContext);

  // Check if Bluetooth is supported on mount
  useEffect(() => {
    setIsBluetoothSupported(bluetoothService.isSupported());
  }, []);

  // Set up Bluetooth message handler
  useEffect(() => {
    bluetoothService.onMessage(handleBluetoothMessage);

    return () => {
      // Clean up Bluetooth connection on unmount
      bluetoothService.disconnect();
    };
  }, []);

  // Load NPCs from localStorage on mount
  useEffect(() => {
    const savedNPCs = localStorage.getItem("survival-npcs");
    if (savedNPCs) {
      try {
        const parsedNPCs = JSON.parse(savedNPCs);
        setNpcs(parsedNPCs);
      } catch (error) {
        console.error("Error parsing saved NPCs:", error);
      }
    }
  }, []);

  // Handle incoming Bluetooth messages
  const handleBluetoothMessage = (message: BluetoothMessage) => {
    console.log("Received Bluetooth message:", message);

    switch (message.type) {
      case MessageType.TRADE_REQUEST:
        handleTradeRequest(message.payload);
        break;
      case MessageType.TRADE_RESPONSE:
        handleTradeResponse(message.payload);
        break;
      case MessageType.TRADE_OFFER:
        handleTradeOffer(message.payload);
        break;
      case MessageType.TRADE_ACCEPT:
        handleTradeAccept(message.payload);
        break;
      case MessageType.TRADE_REJECT:
        handleTradeReject(message.payload);
        break;
      case MessageType.TRADE_COMPLETE:
        handleTradeComplete(message.payload);
        break;
      case MessageType.TRADE_CANCEL:
        handleTradeCancel(message.payload);
        break;
      default:
        console.warn("Unknown message type:", message.type);
    }
  };

  // Handle incoming trade request
  const handleTradeRequest = (payload: any) => {
    setIncomingTradeRequest({
      requestId: payload.requestId,
      fromName: payload.fromName,
    });
  };

  // Handle response to our trade request
  const handleTradeResponse = (payload: any) => {
    if (payload.accepted) {
      // Trade request was accepted, we can now send an offer
      triggerCompanionResponse("bluetooth_trade_request_accepted");
    } else {
      // Trade request was rejected
      triggerCompanionResponse("bluetooth_trade_request_rejected");
      disconnectDevice();
    }
  };

  // Handle incoming trade offer
  const handleTradeOffer = (payload: any) => {
    setIncomingTradeOffer({
      requestId: payload.requestId,
      fromName: payload.fromName,
      items: payload.items,
    });
  };

  // Handle acceptance of our trade offer
  const handleTradeAccept = (payload: any) => {
    // Execute the trade locally
    executeBluetoothTrade(payload.items);

    // Send trade complete message
    bluetoothService.sendMessage({
      type: MessageType.TRADE_COMPLETE,
      payload: {
        requestId: currentTradeId,
        success: true,
      },
    });

    // Reset state
    clearOffers();
    setCurrentTradeId(null);

    triggerCompanionResponse("bluetooth_trade_completed");
  };

  // Handle rejection of our trade offer
  const handleTradeReject = (payload: any) => {
    triggerCompanionResponse("bluetooth_trade_rejected");
    clearOffers();
  };

  // Handle trade completion
  const handleTradeComplete = (payload: any) => {
    if (payload.success) {
      triggerCompanionResponse("bluetooth_trade_completed");
    } else {
      triggerCompanionResponse("bluetooth_trade_failed");
    }

    // Reset state
    clearOffers();
    setIncomingTradeOffer(null);
    setCurrentTradeId(null);
  };

  // Handle trade cancellation
  const handleTradeCancel = (payload: any) => {
    triggerCompanionResponse("bluetooth_trade_cancelled");

    // Reset state
    clearOffers();
    setIncomingTradeRequest(null);
    setIncomingTradeOffer(null);
    setCurrentTradeId(null);
  };

  // Execute a Bluetooth trade
  const executeBluetoothTrade = (receivedItems: InventoryItem[]) => {
    // Create a new trade record
    const newTrade = {
      date: new Date().toISOString(),
      partner: connectedDeviceName || "Unknown trader",
      givenItems: playerOffers.map((item) => ({
        name: item.name,
        quantity: item.quantity,
      })),
      receivedItems: receivedItems.map((item) => ({
        name: item.name,
        quantity: item.quantity,
      })),
    };

    // Add the trade to the trade log
    tradeLogContext.addTradeEntry(newTrade);

    // Update player's inventory - remove offered items
    playerOffers.forEach((item) => {
      const playerItem = inventory.find((i) => i.id === item.id);
      if (playerItem) {
        if (playerItem.quantity > item.quantity) {
          // Reduce quantity if player has more than offered
          updateItemQuantity(item.id, playerItem.quantity - item.quantity);
        } else {
          // Remove item if player offered all they had
          updateItemQuantity(item.id, 0);
        }
      }
    });

    // Update player's inventory - add received items
    receivedItems.forEach((item) => {
      addItem({
        name: item.name,
        category: item.category,
        quantity: item.quantity,
        description: item.description,
        icon: item.icon,
      });
    });
  };

  // Scan for nearby Bluetooth devices
  const scanForDevices = async () => {
    if (!isBluetoothSupported) {
      console.log("Bluetooth not supported on this device");
      triggerCompanionResponse("bluetooth_not_supported");
      return;
    }

    setIsScanning(true);
    console.log("Starting Bluetooth device scan...");

    try {
      // First attempt to scan for devices
      try {
        console.log("Attempting to scan for Bluetooth devices");
        await bluetoothService.scanForDevices();
        
        // If we get here, a device was selected
        console.log("Device selected, attempting to connect");
        await bluetoothService.connect();

        setIsConnected(true);
        setConnectedDeviceName(bluetoothService.getConnectedDeviceName());
        console.log("Connected to device:", bluetoothService.getConnectedDeviceName());

        triggerCompanionResponse("bluetooth_connected");
      } catch (scanError) {
        // Check if the error is because the user canceled the selection
        if (scanError instanceof Error &&
            scanError.message.includes("User cancelled")) {
          console.log("User cancelled device selection");
          triggerCompanionResponse("bluetooth_scan_cancelled");
        } else {
          // Rethrow for the outer catch block
          throw scanError;
        }
      }
    } catch (error) {
      console.error("Error scanning for devices:", error);
      
      // Provide more specific error messages based on the error
      if (error instanceof Error) {
        if (error.message.includes("Bluetooth adapter not available")) {
          triggerCompanionResponse("bluetooth_not_available");
        } else if (error.message.includes("User cancelled")) {
          triggerCompanionResponse("bluetooth_scan_cancelled");
        } else if (error.message.includes("No devices found") ||
                  error.message.includes("No device selected")) {
          triggerCompanionResponse("bluetooth_no_devices");
        } else if (error.message.includes("GATT")) {
          triggerCompanionResponse("bluetooth_connection_failed");
        } else {
          triggerCompanionResponse("bluetooth_scan_failed");
        }
      } else {
        triggerCompanionResponse("bluetooth_scan_failed");
      }
    } finally {
      setIsScanning(false);
    }
  };

  // Connect to a specific Bluetooth device
  const connectToDevice = async (deviceId: string) => {
    console.log("Attempting to connect to device with ID:", deviceId);
    setIsScanning(true);

    try {
      // In a real implementation, we would need to store device references
      // For now, we'll just scan again
      console.log("Scanning for devices again to find the target device");
      await bluetoothService.scanForDevices();
      
      console.log("Attempting to connect to selected device");
      await bluetoothService.connect();

      setIsConnected(true);
      const deviceName = bluetoothService.getConnectedDeviceName();
      setConnectedDeviceName(deviceName);
      console.log("Connected to device:", deviceName);

      triggerCompanionResponse("bluetooth_connected");
    } catch (error) {
      console.error("Error connecting to device:", error);
      
      // Provide more specific error messages based on the error
      if (error instanceof Error) {
        if (error.message.includes("User cancelled")) {
          triggerCompanionResponse("bluetooth_connection_cancelled");
        } else if (error.message.includes("No device selected")) {
          triggerCompanionResponse("bluetooth_no_device_selected");
        } else if (error.message.includes("GATT")) {
          triggerCompanionResponse("bluetooth_gatt_error");
        } else {
          triggerCompanionResponse("bluetooth_connection_failed");
        }
      } else {
        triggerCompanionResponse("bluetooth_connection_failed");
      }
    } finally {
      setIsScanning(false);
    }
  };

  // Disconnect from the current Bluetooth device
  const disconnectDevice = () => {
    console.log("Disconnecting from Bluetooth device");
    
    try {
      bluetoothService.disconnect();
      console.log("Bluetooth service disconnect called");
    } catch (error) {
      console.error("Error during disconnect:", error);
    }
    
    // Always reset state even if disconnect fails
    setIsConnected(false);
    setConnectedDeviceName(null);
    setIncomingTradeRequest(null);
    setIncomingTradeOffer(null);
    setCurrentTradeId(null);
    clearOffers();
    
    console.log("Bluetooth device disconnected and state reset");
  };

  // Send a trade request to the connected device
  const sendTradeRequest = async () => {
    console.log("Attempting to send trade request");
    
    if (!isConnected) {
      console.log("Cannot send trade request: not connected to any device");
      triggerCompanionResponse("bluetooth_not_connected");
      return;
    }

    const requestId = Date.now().toString();
    console.log("Generated trade request ID:", requestId);
    setCurrentTradeId(requestId);

    try {
      const message = {
        type: MessageType.TRADE_REQUEST,
        payload: {
          requestId,
          fromName: "You", // In a real app, this would be the user's name
        },
      };
      
      console.log("Sending trade request message:", message);
      await bluetoothService.sendMessage(message);
      console.log("Trade request sent successfully");

      triggerCompanionResponse("bluetooth_trade_request_sent");
    } catch (error) {
      console.error("Error sending trade request:", error);
      
      // Check if the error is related to disconnection
      if (error instanceof Error &&
          (error.message.includes("disconnected") ||
           error.message.includes("Not connected") ||
           error.message.includes("GATT"))) {
        console.log("Device appears to be disconnected");
        setIsConnected(false);
        setConnectedDeviceName(null);
        triggerCompanionResponse("bluetooth_device_disconnected");
      } else {
        triggerCompanionResponse("bluetooth_trade_request_failed");
      }
    }
  };

  // Accept an incoming trade request
  const acceptTradeRequest = async () => {
    if (!incomingTradeRequest) return;

    setCurrentTradeId(incomingTradeRequest.requestId);

    try {
      await bluetoothService.sendMessage({
        type: MessageType.TRADE_RESPONSE,
        payload: {
          requestId: incomingTradeRequest.requestId,
          accepted: true,
        },
      });

      setIncomingTradeRequest(null);
    } catch (error) {
      console.error("Error accepting trade request:", error);
    }
  };

  // Reject an incoming trade request
  const rejectTradeRequest = () => {
    if (!incomingTradeRequest) return;

    bluetoothService
      .sendMessage({
        type: MessageType.TRADE_RESPONSE,
        payload: {
          requestId: incomingTradeRequest.requestId,
          accepted: false,
        },
      })
      .catch((error) => {
        console.error("Error rejecting trade request:", error);
      });

    setIncomingTradeRequest(null);
  };

  // Send a trade offer to the connected device
  const sendTradeOffer = async () => {
    if (!isConnected || !currentTradeId || playerOffers.length === 0) {
      triggerCompanionResponse("bluetooth_cannot_send_offer");
      return;
    }

    try {
      await bluetoothService.sendMessage({
        type: MessageType.TRADE_OFFER,
        payload: {
          requestId: currentTradeId,
          fromName: "You", // In a real app, this would be the user's name
          items: playerOffers,
        },
      });

      triggerCompanionResponse("bluetooth_trade_offer_sent");
    } catch (error) {
      console.error("Error sending trade offer:", error);
      triggerCompanionResponse("bluetooth_trade_offer_failed");
    }
  };

  // Accept an incoming trade offer
  const acceptTradeOffer = async () => {
    if (!incomingTradeOffer) return;

    try {
      // Execute the trade locally
      executeBluetoothTrade(incomingTradeOffer.items);

      // Send acceptance message
      await bluetoothService.sendMessage({
        type: MessageType.TRADE_ACCEPT,
        payload: {
          requestId: incomingTradeOffer.requestId,
          items: playerOffers,
        },
      });

      // Reset state
      setIncomingTradeOffer(null);
      clearOffers();

      triggerCompanionResponse("bluetooth_trade_completed");
    } catch (error) {
      console.error("Error accepting trade offer:", error);
      triggerCompanionResponse("bluetooth_trade_accept_failed");
    }
  };

  // Reject an incoming trade offer
  const rejectTradeOffer = () => {
    if (!incomingTradeOffer) return;

    bluetoothService
      .sendMessage({
        type: MessageType.TRADE_REJECT,
        payload: {
          requestId: incomingTradeOffer.requestId,
        },
      })
      .catch((error) => {
        console.error("Error rejecting trade offer:", error);
      });

    setIncomingTradeOffer(null);
  };

  // Select an NPC for trading
  const selectNPC = (npc: NPC | null) => {
    if (npc) {
      // Find the latest version of this NPC from the npcs state
      const latestNPC = npcs.find((n) => n.id === npc.id) || npc;
      setSelectedNPC(latestNPC);
    } else {
      setSelectedNPC(null);
    }
    clearOffers();
  };

  // Add an item to the player's offer
  const addToPlayerOffer = (item: InventoryItem) => {
    // Check if the item is already in the offer
    const existingItem = playerOffers.find((i) => i.id === item.id);
    if (existingItem) {
      // Increment the quantity
      const updatedOffers = playerOffers.map((i) =>
        i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
      );
      setPlayerOffers(updatedOffers);
    } else {
      // Add the item with quantity 1
      setPlayerOffers([...playerOffers, { ...item, quantity: 1 }]);
    }
  };

  // Remove an item from the player's offer
  const removeFromPlayerOffer = (itemId: string) => {
    setPlayerOffers(playerOffers.filter((item) => item.id !== itemId));
  };

  // Add an item to the NPC's offer
  const addToNPCOffer = (item: InventoryItem) => {
    // Check if the item is already in the offer
    const existingItem = npcOffers.find((i) => i.id === item.id);
    if (existingItem) {
      // Increment the quantity
      const updatedOffers = npcOffers.map((i) =>
        i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
      );
      setNpcOffers(updatedOffers);
    } else {
      // Add the item with quantity 1
      setNpcOffers([...npcOffers, { ...item, quantity: 1 }]);
    }
  };

  // Remove an item from the NPC's offer
  const removeFromNPCOffer = (itemId: string) => {
    setNpcOffers(npcOffers.filter((item) => item.id !== itemId));
  };

  // Execute the trade with an NPC
  const executeTrade = () => {
    if (!selectedNPC || playerOffers.length === 0 || npcOffers.length === 0) {
      return;
    }

    // Create a new trade record
    const newTrade = {
      date: new Date().toISOString(),
      partner: selectedNPC.name,
      givenItems: playerOffers.map((item) => ({
        name: item.name,
        quantity: item.quantity,
      })),
      receivedItems: npcOffers.map((item) => ({
        name: item.name,
        quantity: item.quantity,
      })),
    };

    // Add the trade to the trade log
    console.log("Adding trade to log:", newTrade);
    tradeLogContext.addTradeEntry(newTrade);

    // Update player's inventory - remove offered items
    playerOffers.forEach((item) => {
      const playerItem = inventory.find((i) => i.id === item.id);
      if (playerItem) {
        if (playerItem.quantity > item.quantity) {
          // Reduce quantity if player has more than offered
          updateItemQuantity(item.id, playerItem.quantity - item.quantity);
        } else {
          // Remove item if player offered all they had
          updateItemQuantity(item.id, 0);
        }
      }
    });

    // Update player's inventory - add received items
    npcOffers.forEach((item) => {
      addItem({
        name: item.name,
        category: item.category,
        quantity: item.quantity,
        description: item.description,
        icon: item.icon,
      });
    });

    // Update NPC's inventory - remove offered items and add player's items
    if (selectedNPC) {
      const updatedNpcs = npcs.map((npc) => {
        if (npc.id === selectedNPC.id) {
          // Create a deep copy of the NPC
          const updatedNpc = { ...npc };
          // Create a new inventory array with updated quantities
          updatedNpc.inventory = npc.inventory.reduce((newInventory, item) => {
            const offeredItem = npcOffers.find(
              (offered) => offered.id === item.id
            );

            if (!offeredItem) {
              // Item wasn't offered, keep it unchanged
              newInventory.push({ ...item });
              return newInventory;
            }

            // If the NPC offered some but not all, reduce quantity
            if (item.quantity > offeredItem.quantity) {
              newInventory.push({
                ...item,
                quantity: item.quantity - offeredItem.quantity,
              });
            }
            // If the NPC offered all, don't add it to the new inventory

            return newInventory;
          }, [] as InventoryItem[]);

          // Add items the player offered
          playerOffers.forEach((playerItem) => {
            // Check if NPC already has this item
            const existingItemIndex = updatedNpc.inventory.findIndex(
              (item) =>
                item.name === playerItem.name &&
                item.category === playerItem.category
            );

            if (existingItemIndex >= 0) {
              // Create a new array with the updated item
              updatedNpc.inventory = [
                ...updatedNpc.inventory.slice(0, existingItemIndex),
                {
                  ...updatedNpc.inventory[existingItemIndex],
                  quantity:
                    updatedNpc.inventory[existingItemIndex].quantity +
                    playerItem.quantity,
                },
                ...updatedNpc.inventory.slice(existingItemIndex + 1),
              ];
            } else {
              // Add new item to NPC's inventory
              updatedNpc.inventory.push({
                id: `npc-${Date.now()}-${Math.random()
                  .toString(36)
                  .substr(2, 9)}`,
                name: playerItem.name,
                category: playerItem.category,
                quantity: playerItem.quantity,
                description: playerItem.description || "",
                icon: playerItem.icon || `${playerItem.category}.png`,
              });
            }
          });

          return updatedNpc;
        }
        return npc;
      });
      // Update NPCs state and save to localStorage
      setNpcs(updatedNpcs);
      localStorage.setItem("survival-npcs", JSON.stringify(updatedNpcs));
    }

    // Clear the offers
    clearOffers();

    // Trigger companion response
    const receivedItemNames = npcOffers.map((item) => item.name).join(", ");
    triggerCompanionResponse(`trade_completed:${receivedItemNames}`);
  };

  // Clear all offers
  const clearOffers = () => {
    setPlayerOffers([]);
    setNpcOffers([]);
  };

  return (
    <BarterContext.Provider
      value={{
        npcs,
        selectedNPC,
        playerOffers,
        npcOffers,

        // Bluetooth trading state
        isBluetoothSupported,
        isScanning,
        isConnected,
        connectedDeviceName,
        incomingTradeRequest,
        incomingTradeOffer,

        // NPC trading methods
        selectNPC,
        addToPlayerOffer,
        removeFromPlayerOffer,
        addToNPCOffer,
        removeFromNPCOffer,
        executeTrade,
        clearOffers,

        // Bluetooth trading methods
        scanForDevices,
        connectToDevice,
        disconnectDevice,
        sendTradeRequest,
        acceptTradeRequest,
        rejectTradeRequest,
        sendTradeOffer,
        acceptTradeOffer,
        rejectTradeOffer,
      }}
    >
      {children}
    </BarterContext.Provider>
  );
};
