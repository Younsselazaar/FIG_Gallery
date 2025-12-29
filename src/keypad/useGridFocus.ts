import { useCallback, useEffect, useState } from "react";
import { useKeypad } from "./KeypadContext";
import { KeyCodes } from "./keyCodes";

/**
 * useGridFocus.ts
 * ----------------
 * Deterministic grid focus manager for FIG Gallery.
 *
 * Rules:
 * - Works with DPAD only
 * - No touch assumptions
 * - No layout measurement
 * - Index-based (fast, predictable)
 * - Safe for thousands of items
 */

type Options = {
  itemCount: number;
  columns: number;
  initialIndex?: number;
  onSelect?: (index: number) => void;
};

export function useGridFocus({
  itemCount,
  columns,
  initialIndex = 0,
  onSelect,
}: Options) {
  const { registerHandler, unregisterHandler } = useKeypad();
  const [focusedIndex, setFocusedIndex] = useState<number>(initialIndex);

  const clamp = (index: number) => {
    if (index < 0) return 0;
    if (index >= itemCount) return itemCount - 1;
    return index;
  };

  const move = useCallback(
    (delta: number) => {
      setFocusedIndex((prev) => clamp(prev + delta));
    },
    [itemCount]
  );

  const handleKey = useCallback(
    (keyCode: number) => {
      if (itemCount === 0) return false;

      switch (keyCode) {
        case KeyCodes.DPAD_LEFT:
          move(-1);
          return true;

        case KeyCodes.DPAD_RIGHT:
          move(1);
          return true;

        case KeyCodes.DPAD_UP:
          move(-columns);
          return true;

        case KeyCodes.DPAD_DOWN:
          move(columns);
          return true;

        case KeyCodes.DPAD_CENTER:
          onSelect?.(focusedIndex);
          return true;

        default:
          return false;
      }
    },
    [columns, focusedIndex, itemCount, move, onSelect]
  );

  useEffect(() => {
    registerHandler(handleKey);
    return () => unregisterHandler(handleKey);
  }, [handleKey, registerHandler, unregisterHandler]);

  return {
    focusedIndex,
    setFocusedIndex,
  };
}
