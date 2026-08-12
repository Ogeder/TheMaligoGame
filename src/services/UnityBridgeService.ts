// Unity WebGL Bidirectional Communication Bridge for MaliGo
// Handles synchronization between React State <-> Unity C# WebGL Instance

export interface UnityPlayerState {
  characterName: string;
  characterType: string;
  balance: number;
  savings: number;
  debt: number;
  stress: number;
  lives: number;
  estateTitle: string;
  hasSolarInverter: boolean;
  hasSmartLaptop: boolean;
  hasShield: boolean;
  plantLevel: number;
}

export interface UnityEventPayload {
  action: string;
  data?: any;
}

type UnityEventCallback = (payload: UnityEventPayload) => void;

class UnityBridgeManager {
  private unityInstance: any = null;
  private listeners: Map<string, UnityEventCallback[]> = new Map();

  constructor() {
    if (typeof window !== "undefined") {
      // Expose global window handler for C# Unity Application to invoke React callbacks
      (window as any).dispatchUnityEvent = (action: string, jsonPayloadStr?: string) => {
        let data = null;
        if (jsonPayloadStr) {
          try {
            data = JSON.parse(jsonPayloadStr);
          } catch (e) {
            data = jsonPayloadStr;
          }
        }
        this.emit(action, { action, data });
      };
    }
  }

  // Register Unity WebGL Instance reference once loaded
  public setUnityInstance(instance: any) {
    this.unityInstance = instance;
    console.log("🎮 [UnityBridge] Unity WebGL Instance attached successfully.");
  }

  // Send JSON serialized state to Unity C# GameObject
  public sendStateToUnity(
    state: UnityPlayerState,
    gameObjectName: string = "MaliGoWorldController",
    methodName: string = "SyncPlayerStateFromReact"
  ) {
    if (this.unityInstance && typeof this.unityInstance.SendMessage === "function") {
      const jsonStr = JSON.stringify(state);
      this.unityInstance.SendMessage(gameObjectName, methodName, jsonStr);
      console.log(`📤 [UnityBridge] Sent player state to Unity (${gameObjectName}.${methodName}):`, state);
    } else {
      console.warn("⚠️ [UnityBridge] Unity Instance not ready yet. Queued state sync.");
    }
  }

  // Send custom action to Unity
  public sendActionToUnity(
    actionName: string,
    payload: any = {},
    gameObjectName: string = "MaliGoWorldController",
    methodName: string = "OnReactActionReceived"
  ) {
    if (this.unityInstance && typeof this.unityInstance.SendMessage === "function") {
      const message = JSON.stringify({ action: actionName, payload });
      this.unityInstance.SendMessage(gameObjectName, methodName, message);
    }
  }

  // Subscribe to Unity events in React
  public on(action: string, callback: UnityEventCallback) {
    if (!this.listeners.has(action)) {
      this.listeners.set(action, []);
    }
    this.listeners.get(action)?.push(callback);
  }

  // Unsubscribe
  public off(action: string, callback: UnityEventCallback) {
    const list = this.listeners.get(action);
    if (list) {
      this.listeners.set(
        action,
        list.filter(cb => cb !== callback)
      );
    }
  }

  // Emit event internally
  private emit(action: string, payload: UnityEventPayload) {
    console.log(`📥 [UnityBridge] Event received from Unity C#:`, payload);
    const callbacks = this.listeners.get(action);
    if (callbacks) {
      callbacks.forEach(cb => cb(payload));
    }
    // Also trigger wildcard listeners
    const wildcard = this.listeners.get("*");
    if (wildcard) {
      wildcard.forEach(cb => cb(payload));
    }
  }
}

export const UnityBridge = new UnityBridgeManager();
