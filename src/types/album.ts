/**
 * album.ts
 * --------
 * Album data model for FIG Gallery.
 *
 * Rules:
 * - Offline-first
 * - No backend assumptions
 * - Minimal fields only
 * - Safe for SQLite / AsyncStorage
 */

export type Album = {
  /** Unique album ID (UUID / generated string) */
  id: string;

  /** Album display name (single-line) */
  name: string;

  /** Optional description (not shown in list views) */
  description?: string;

  /** Optional cover photo ID */
  coverPhotoId?: string;

  /** Creation timestamp (ms) */
  createdAt: number;

  /** Last updated timestamp (ms) */
  updatedAt: number;

  /** System album flag (e.g. Videos, Favorites) */
  system?: boolean;
};
