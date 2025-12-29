/**
 * syncService.ts
 * ---------------
 * Offline-first sync coordinator for FIG Gallery.
 *
 * IMPORTANT DESIGN RULES:
 * - Sync is MANUAL + EXPLICIT
 * - Base44 is OPTIONAL and DISABLED by default
 * - App must function perfectly with ZERO network
 * - No background polling
 * - No automatic uploads
 *
 * This file exists to:
 * - Replay queued operations
 * - Provide a future sync hook
 * - Keep architecture clean
 */

import { isBase44Enabled } from "./base44Client";
import { getQueuedOperations, clearQueue } from "../db/syncQueue";

/**
 * Result type for sync attempts
 */
export type SyncResult = {
  attempted: boolean;
  success: boolean;
  error?: string;
};

/**
 * Run sync (NO-OP if Base44 disabled)
 */
export async function runSync(): Promise<SyncResult> {
  if (!isBase44Enabled()) {
    return {
      attempted: false,
      success: false,
      error: "Base44 disabled",
    };
  }

  try {
    const ops = await getQueuedOperations();

    if (!ops.length) {
      return {
        attempted: true,
        success: true,
      };
    }

    /**
     * IMPORTANT:
     * We DO NOT auto-apply ops here.
     * Each op type must be explicitly mapped.
     * This prevents accidental data leaks.
     */
    for (const op of ops) {
      // Future mapping example:
      // if (op.type === "UPLOAD_PHOTO") { ... }
      // if (op.type === "EDIT_PHOTO") { ... }
    }

    await clearQueue();

    return {
      attempted: true,
      success: true,
    };
  } catch (err: any) {
    return {
      attempted: true,
      success: false,
      error: err?.message ?? "Unknown sync error",
    };
  }
}

/**
 * Helper to check if sync is available
 */
export function canSync(): boolean {
  return isBase44Enabled();
}
