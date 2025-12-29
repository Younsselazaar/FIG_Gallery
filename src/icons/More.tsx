import * as React from "react";
import Svg, { Circle } from "react-native-svg";

/**
 * More.tsx
 * --------
 * Base44-style "more options" (3-dot) icon.
 *
 * Rules:
 * - Horizontal dots (matches Base44)
 * - Stroke-less circles (clean at small sizes)
 * - Works at 16–24px
 * - Color injected via props
 * - Used for overflow / context menus
 */

type Props = {
  width?: number;
  height?: number;
  color?: string;
};

export default function MoreIcon({
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
      <Circle cx="6" cy="12" r="1.75" fill={color} />
      <Circle cx="12" cy="12" r="1.75" fill={color} />
      <Circle cx="18" cy="12" r="1.75" fill={color} />
    </Svg>
  );
}
