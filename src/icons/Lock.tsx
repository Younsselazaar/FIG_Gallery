import * as React from "react";
import Svg, { Rect, Path } from "react-native-svg";

/**
 * Lock.tsx
 * --------
 * Base44-style lock icon (used for Locked Folder / PIN).
 *
 * Rules:
 * - Stroke-based SVG
 * - Clear at small sizes (3.5" FIG phones)
 * - Color injected via props
 * - No fills, no gradients
 */

type Props = {
  width?: number;
  height?: number;
  color?: string;
};

export default function LockIcon({
  width = 24,
  height = 24,
  color = "#FFFFFF",
}: Props) {
  return (
    <Svg
      width={width}
      height={height}
      viewBox="0 0 24 24"
      fill="none"
    >
      {/* Lock body */}
      <Rect
        x="5"
        y="11"
        width="14"
        height="9"
        rx="2"
        stroke={color}
        strokeWidth="1.75"
      />

      {/* Shackle */}
      <Path
        d="M8 11V8a4 4 0 0 1 8 0v3"
        stroke={color}
        strokeWidth="1.75"
        strokeLinecap="round"
      />
    </Svg>
  );
}
