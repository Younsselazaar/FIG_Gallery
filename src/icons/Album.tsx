import * as React from "react";
import Svg, { Rect, Path } from "react-native-svg";

/**
 * Album.tsx
 * ----------
 * Base44-style album icon.
 *
 * Rules:
 * - SVG only (react-native-svg)
 * - Stroke-based (scales cleanly)
 * - Works at small sizes (3.5" FIG phones)
 * - Color is injected via props
 */

type Props = {
  width?: number;
  height?: number;
  color?: string;
};

export default function AlbumIcon({
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
      {/* Background card */}
      <Rect
        x="3"
        y="4"
        width="18"
        height="16"
        rx="2"
        stroke={color}
        strokeWidth="1.75"
      />

      {/* Inner photo rectangle */}
      <Rect
        x="6"
        y="7"
        width="8"
        height="6"
        rx="1"
        stroke={color}
        strokeWidth="1.5"
      />

      {/* Mountain line */}
      <Path
        d="M6 15l3-3 2 2 3-3 4 4"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}
