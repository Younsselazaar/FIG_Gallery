import * as React from "react";
import Svg, { Rect, Path } from "react-native-svg";

/**
 * Trash.tsx
 * ----------
 * Base44-style trash / delete icon.
 *
 * Rules:
 * - Stroke-based SVG (crisp at small sizes)
 * - No fills, no gradients
 * - Color injected via props
 * - Safe for 3.5" FIG phones
 */

type Props = {
  width?: number;
  height?: number;
  color?: string;
};

export default function TrashIcon({
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
      {/* Bin body */}
      <Rect
        x="6"
        y="8"
        width="12"
        height="12"
        rx="2"
        stroke={color}
        strokeWidth="1.75"
      />

      {/* Lid */}
      <Path
        d="M4 8h16"
        stroke={color}
        strokeWidth="1.75"
        strokeLinecap="round"
      />

      {/* Handle */}
      <Path
        d="M10 5h4"
        stroke={color}
        strokeWidth="1.75"
        strokeLinecap="round"
      />

      {/* Inner lines */}
      <Path
        d="M10 11v6M14 11v6"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </Svg>
  );
}
