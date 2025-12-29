/**
 * photo.ts
 * --------
 * Photo data model for FIG Gallery.
 *
 * DESIGN RULES:
 * - Offline-first
 * - Minimal but complete
 * - No UI state
 * - No backend assumptions
 * - Scales to tens of thousands of photos
 */

export type Photo = {
  /** Unique photo ID (UUID / generated string) */
  id: string;

  /** Local file URI */
  uri: string;

  /** Optional thumbnail URI (pre-generated) */
  thumbnailUri?: string;

  /** Display name (filename or user-edited title) */
  title?: string;

  /** Creation timestamp (ms) */
  createdAt: number;

  /** Last modified timestamp (ms) */
  updatedAt: number;

  /** Favorite flag */
  favorite?: boolean;

  /** Hidden / locked folder flag */
  hidden?: boolean;

  /** Trashed flag */
  trashed?: boolean;

  /** Optional album IDs this photo belongs to */
  albumIds?: string[];

  /** Optional EXIF / metadata (stored raw, not parsed) */
  metadata?: Record<string, any>;
};
