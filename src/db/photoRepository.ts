import { getDB } from "./database";
import { Photo } from "../types/photo";

/**
 * photoRepository.ts
 * ------------------
 * Offline-first photo data access layer.
 *
 * Rules:
 * - SQLite-backed
 * - Handles tens of thousands of photos
 * - No network assumptions
 * - Base44-compatible photo behavior
 */

export async function getAllPhotos(): Promise<Photo[]> {
  const db = await getDB();
  const results = await db.executeSql(
    `SELECT * FROM photos
     WHERE trashed = 0 AND hidden = 0 AND (archived = 0 OR archived IS NULL)
     ORDER BY createdAt DESC`
  );

  const rows = results[0].rows;
  const photos: Photo[] = [];

  for (let i = 0; i < rows.length; i++) {
    photos.push(rows.item(i));
  }

  return photos;
}

export async function getPhotoById(
  photoId: string
): Promise<Photo | null> {
  const db = await getDB();
  const results = await db.executeSql(
    `SELECT * FROM photos WHERE id = ? LIMIT 1`,
    [photoId]
  );

  const rows = results[0].rows;
  return rows.length > 0 ? rows.item(0) : null;
}

export async function insertPhoto(photo: Photo): Promise<void> {
  const db = await getDB();
  await db.executeSql(
    `INSERT OR REPLACE INTO photos
      (id, uri, createdAt, modifiedAt, favorite, hidden, archived, trashed)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      photo.id,
      photo.uri,
      photo.createdAt,
      photo.modifiedAt,
      photo.favorite ? 1 : 0,
      photo.hidden ? 1 : 0,
      photo.archived ? 1 : 0,
      photo.trashed ? 1 : 0,
    ]
  );
}

export async function markFavorite(
  photoId: string,
  favorite: boolean
): Promise<void> {
  const db = await getDB();
  await db.executeSql(
    `UPDATE photos SET favorite = ? WHERE id = ?`,
    [favorite ? 1 : 0, photoId]
  );
}

export async function hidePhoto(
  photoId: string,
  hidden: boolean
): Promise<void> {
  const db = await getDB();
  await db.executeSql(
    `UPDATE photos SET hidden = ? WHERE id = ?`,
    [hidden ? 1 : 0, photoId]
  );
}

export async function archivePhoto(
  photoId: string,
  archived: boolean
): Promise<void> {
  const db = await getDB();
  await db.executeSql(
    `UPDATE photos SET archived = ? WHERE id = ?`,
    [archived ? 1 : 0, photoId]
  );
}

export async function trashPhoto(
  photoId: string,
  trashed: boolean
): Promise<void> {
  const db = await getDB();
  await db.executeSql(
    `UPDATE photos SET trashed = ? WHERE id = ?`,
    [trashed ? 1 : 0, photoId]
  );
}

export async function deletePhotoPermanently(
  photoId: string
): Promise<void> {
  const db = await getDB();
  await db.transaction(async (tx) => {
    tx.executeSql(`DELETE FROM photos WHERE id = ?`, [photoId]);
    tx.executeSql(`DELETE FROM album_photos WHERE photoId = ?`, [photoId]);
    tx.executeSql(`DELETE FROM edits WHERE photoId = ?`, [photoId]);
  });
}

export async function getFavoritePhotos(): Promise<Photo[]> {
  const db = await getDB();
  const results = await db.executeSql(
    `SELECT * FROM photos
     WHERE favorite = 1 AND trashed = 0
     ORDER BY createdAt DESC`
  );

  const rows = results[0].rows;
  const photos: Photo[] = [];

  for (let i = 0; i < rows.length; i++) {
    photos.push(rows.item(i));
  }

  return photos;
}

export async function getTrashedPhotos(): Promise<Photo[]> {
  const db = await getDB();
  const results = await db.executeSql(
    `SELECT * FROM photos
     WHERE trashed = 1
     ORDER BY modifiedAt DESC`
  );

  const rows = results[0].rows;
  const photos: Photo[] = [];

  for (let i = 0; i < rows.length; i++) {
    photos.push(rows.item(i));
  }

  return photos;
}

export async function getHiddenPhotos(): Promise<Photo[]> {
  const db = await getDB();
  const results = await db.executeSql(
    `SELECT * FROM photos
     WHERE hidden = 1 AND (archived = 0 OR archived IS NULL) AND trashed = 0
     ORDER BY modifiedAt DESC`
  );

  const rows = results[0].rows;
  const photos: Photo[] = [];

  for (let i = 0; i < rows.length; i++) {
    photos.push(rows.item(i));
  }

  return photos;
}

export async function getArchivedPhotos(): Promise<Photo[]> {
  const db = await getDB();
  const results = await db.executeSql(
    `SELECT * FROM photos
     WHERE archived = 1 AND (hidden = 0 OR hidden IS NULL) AND trashed = 0
     ORDER BY modifiedAt DESC`
  );

  const rows = results[0].rows;
  const photos: Photo[] = [];

  for (let i = 0; i < rows.length; i++) {
    photos.push(rows.item(i));
  }

  return photos;
}

export async function cleanupStalePhotos(validUris: Set<string>): Promise<number> {
  const db = await getDB();
  const results = await db.executeSql(
    `SELECT id, uri FROM photos WHERE trashed = 0`
  );

  const rows = results[0].rows;
  const staleIds: string[] = [];

  for (let i = 0; i < rows.length; i++) {
    const photo = rows.item(i);
    if (!validUris.has(photo.uri)) {
      staleIds.push(photo.id);
    }
  }

  if (staleIds.length > 0) {
    // Delete stale photos from database
    for (const id of staleIds) {
      await db.executeSql(`DELETE FROM photos WHERE id = ?`, [id]);
      await db.executeSql(`DELETE FROM album_photos WHERE photoId = ?`, [id]);
    }
  }

  return staleIds.length;
}

export async function searchPhotos(query: string): Promise<Photo[]> {
  const db = await getDB();
  const searchTerm = `%${query}%`;
  const results = await db.executeSql(
    `SELECT * FROM photos
     WHERE trashed = 0 AND hidden = 0
     AND (uri LIKE ? OR id LIKE ?)
     ORDER BY createdAt DESC
     LIMIT 100`,
    [searchTerm, searchTerm]
  );

  const rows = results[0].rows;
  const photos: Photo[] = [];

  for (let i = 0; i < rows.length; i++) {
    photos.push(rows.item(i));
  }

  return photos;
}
