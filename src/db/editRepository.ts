import { db } from "./database";

/**
 * editRepository.ts
 * -----------------
 * Stores non-destructive edit history for photos.
 *
 * Rules:
 * - Offline-only
 * - Append-only history
 * - Safe for large libraries
 * - Base44-compatible edit model
 *
 * Notes:
 * - Actual image processing happens elsewhere
 * - This table records WHAT was done, not pixels
 */

export type EditRecord = {
  id: string;
  photoId: string;
  type: string;     // e.g. "adjust", "filter", "crop", "markup"
  payload: string;  // JSON string describing the edit
  createdAt: number;
};

export async function addEdit(
  record: EditRecord
): Promise<void> {
  await db.executeSql(
    `INSERT INTO edits (id, photoId, type, payload, createdAt)
     VALUES (?, ?, ?, ?, ?)`,
    [
      record.id,
      record.photoId,
      record.type,
      record.payload,
      record.createdAt,
    ]
  );
}

export async function getEditsForPhoto(
  photoId: string
): Promise<EditRecord[]> {
  const results = await db.executeSql(
    `SELECT * FROM edits
     WHERE photoId = ?
     ORDER BY createdAt ASC`,
    [photoId]
  );

  const rows = results[0].rows;
  const edits: EditRecord[] = [];

  for (let i = 0; i < rows.length; i++) {
    edits.push(rows.item(i));
  }

  return edits;
}

export async function deleteEditsForPhoto(
  photoId: string
): Promise<void> {
  await db.executeSql(
    `DELETE FROM edits WHERE photoId = ?`,
    [photoId]
  );
}

export async function deleteSingleEdit(
  editId: string
): Promise<void> {
  await db.executeSql(
    `DELETE FROM edits WHERE id = ?`,
    [editId]
  );
}
