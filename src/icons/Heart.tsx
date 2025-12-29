import * as React from "react";
import Svg, { Path } from "react-native-svg";

/**
 * Heart.tsx
 * ---------
 * Base44-style favorite (heart) icon.
 *
 * Rules:
 * - Stroke-based SVG (no fill by default)
 * - Scales cleanly for 3.5" FIG phones
 * - Color injected via props
 * - Filled state handled by color, not geometry
 */

type Props = {
  width?: number;
  height?: number;
  color?: string;
};

export default function HeartIcon({
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
      <Path
        d="M12 21s-6.5-4.3-9-8.5C1.4 9.2 3.3 6 6.7 6c2 0 3.3 1.1 4.3 2.4C12 7.1 13.3 6 15.3 6c3.4 0 5.3 3.2 3.7 6.5C18.5 16.7 12 21 12 21z"
        stroke={color}
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}
