import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  ReactNode,
} from "react";
import { BackHandler, NativeEventEmitter, NativeModules } from "react-native";
import { KeyCodes, isDpadKey, isNumericKey } from "./keyCodes";

/**
 * KeypadContext.tsx
 * -----------------
 * Central keypad / DPAD event manager for FIG Gallery.
 *
 * Rules:
 * - One global listener
 * - Screen-level registration
 * - Deterministic focus movement
 * - No web / touch assumptions
 */

type KeyHandler = (keyCode: number) => boolean;

type KeypadContextType = {
  registerHandler: (handler: KeyHandler) => void;
  unregisterHandler: (handler: KeyHandler) => void;
};

const KeypadContext = createContext<KeypadContextType | null>(null);

export function useKeypad() {
  const ctx = useContext(KeypadContext);
  if (!ctx) {
    throw new Error("useKeypad must be used within KeypadProvider");
  }
  return ctx;
}

type Props = {
  children: ReactNode;
};

export function KeypadProvider({ children }: Props) {
  const handlersRef = useRef<KeyHandler[]>([]);

  /**
   * Register a handler (LIFO – top screen wins)
   */
  const registerHandler = (handler: KeyHandler) => {
    handlersRef.current.unshift(handler);
  };

  /**
   * Unregister a handler
   */
  const unregisterHandler = (handler: KeyHandler) => {
    handlersRef.current = handlersRef.current.filter(h => h !== handler);
  };

  /**
   * Dispatch key event to registered handlers
   */
  const dispatchKey = (keyCode: number): boolean => {
    for (const handler of handlersRef.current) {
      const handled = handler(keyCode);
      if (handled) return true;
    }
    return false;
  };

  /**
   * Android hardware back button
   */
  useEffect(() => {
    const sub = BackHandler.addEventListener("hardwareBackPress", () => {
      return dispatchKey(KeyCodes.BACK);
    });

    return () => sub.remove();
  }, []);

  /**
   * Native key events (DPAD / keypad)
   *
   * NOTE:
   * React Native does not expose KeyEvent directly.
   * FIG system builds inject key events via native layer.
   */
  useEffect(() => {
    const emitter = new NativeEventEmitter(
      NativeModules.FigKeyEventModule || NativeModules.DeviceEventManagerModule
    );

    const subscription = emitter.addListener(
      "onKeyDown",
      (event: { keyCode: number }) => {
        dispatchKey(event.keyCode);
      }
    );

    return () => subscription.remove();
  }, []);

  return (
    <KeypadContext.Provider
      value={{
        registerHandler,
        unregisterHandler,
      }}
    >
      {children}
    </KeypadContext.Provider>
  );
}
