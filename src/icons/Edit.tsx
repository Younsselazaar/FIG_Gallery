import * as React from "react";
import Svg, { Path } from "react-native-svg";

/**
 * Edit.tsx
 * --------
 * Base44-style edit (pen) icon.
 *
 * Rules:
 * - SVG only (react-native-svg)
 * - Stroke-based (crisp at small sizes)
 * - Optimized for 3.5" FIG phones
 * - Color injected via props
 */

type Props = {
  width?: number;
  height?: number;
  color?: string;
};

export default function EditIcon({
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
      {/* Pen body */}
      <Path
        d="M4 20l4.5-1 9.9-9.9a2.1 2.1 0 0 0 0-3l-.5-.5a2.1 2.1 0 0 0-3 0L5 15.5 4 20z"
        stroke={color}
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Pen tip detail */}
      <Path
        d="M13.5 6.5l4 4"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </Svg>
  );
}
