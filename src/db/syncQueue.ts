import { db } from "./database";

/**
 * syncQueue.ts
 * ------------
 * Offline sync queue (currently DISABLED backend).
 *
 * Purpose:
 * - Record user actions while offline
 * - Preserve intent for future sync
 * - Safe no-op when Base44 backend is disabled
 *
 * IMPORTANT:
 * - This file does NOT perform networking
 * - This file only records intent
 */

export type SyncAction =
  | "create"
  | "update"
  | "delete";

export type SyncEntity =
  | "photo"
  | "album"
  | "edit";

export type SyncQueueItem = {
  id: string;
  entityType: SyncEntity;
  entityId: string;
  action: SyncAction;
  payload?: string; // JSON string
  createdAt: number;
};

/**
 * Enqueue a sync action.
 * Safe to call even when backend is disabled.
 */
export async function enqueueSync(
  item: SyncQueueItem
): Promise<void> {
  await db.executeSql(
    `INSERT INTO sync_queue
      (id, entityType, entityId, action, payload, createdAt)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [
      item.id,
      item.entityType,
      item.entityId,
      item.action,
      item.payload ?? null,
      item.createdAt,
    ]
  );
}

/**
 * Retrieve all pending sync actions.
 * (Future use only)
 */
export async function getPendingSyncItems(): Promise<SyncQueueItem[]> {
  const results = await db.executeSql(
    `SELECT * FROM sync_queue
     ORDER BY createdAt ASC`
  );

  const rows = results[0].rows;
  const items: SyncQueueItem[] = [];

  for (let i = 0; i < rows.length; i++) {
    items.push(rows.item(i));
  }

  return items;
}

/**
 * Remove a sync item after successful processing.
 */
export async function removeSyncItem(
  syncId: string
): Promise<void> {
  await db.executeSql(
    `DELETE FROM sync_queue WHERE id = ?`,
    [syncId]
  );
}

/**
 * Clear entire queue (factory reset / debug).
 */
export async function clearSyncQueue(): Promise<void> {
  await db.executeSql(`DELETE FROM sync_queue`);
}
