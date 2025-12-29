import { getDB } from "./database";
import { Album } from "../types/album";

/**
 * albumRepository.ts
 * ------------------
 * Offline-first album data access layer for FIG Gallery.
 *
 * Rules:
 * - SQLite-backed
 * - No network assumptions
 * - Safe for thousands of albums
 * - Base44-compatible data model
 */

export async function getAllAlbums(): Promise<Album[]> {
  const db = await getDB();
  const results = await db.executeSql(
    `SELECT * FROM albums ORDER BY name COLLATE NOCASE ASC`
  );

  const rows = results[0].rows;
  const albums: Album[] = [];

  for (let i = 0; i < rows.length; i++) {
    albums.push(rows.item(i));
  }

  return albums;
}

export async function getAlbumById(albumId: string): Promise<Album | null> {
  const db = await getDB();
  const results = await db.executeSql(
    `SELECT * FROM albums WHERE id = ? LIMIT 1`,
    [albumId]
  );

  const rows = results[0].rows;
  return rows.length > 0 ? rows.item(0) : null;
}

export async function createAlbum(name: string, description?: string): Promise<Album> {
  const db = await getDB();
  const id = `album_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const createdAt = Date.now();

  await db.executeSql(
    `INSERT INTO albums (id, name, description, createdAt)
     VALUES (?, ?, ?, ?)`,
    [id, name, description ?? "", createdAt]
  );

  return { id, name, description, createdAt, photoCount: 0 };
}

export async function updateAlbum(
  albumId: string,
  name: string,
  description?: string
): Promise<void> {
  const db = await getDB();
  await db.executeSql(
    `UPDATE albums SET name = ?, description = ? WHERE id = ?`,
    [name, description ?? "", albumId]
  );
}

export async function deleteAlbum(albumId: string): Promise<void> {
  const db = await getDB();
  // Remove album reference but DO NOT delete photos
  await db.executeSql(
    `DELETE FROM albums WHERE id = ?`,
    [albumId]
  );

  await db.executeSql(
    `DELETE FROM album_photos WHERE albumId = ?`,
    [albumId]
  );
}

export async function addPhotoToAlbum(
  albumId: string,
  photoId: string
): Promise<void> {
  const db = await getDB();
  await db.executeSql(
    `INSERT OR IGNORE INTO album_photos (albumId, photoId)
     VALUES (?, ?)`,
    [albumId, photoId]
  );
}

export async function removePhotoFromAlbum(
  albumId: string,
  photoId: string
): Promise<void> {
  const db = await getDB();
  await db.executeSql(
    `DELETE FROM album_photos WHERE albumId = ? AND photoId = ?`,
    [albumId, photoId]
  );
}

export async function getPhotosForAlbum(
  albumId: string
): Promise<string[]> {
  const db = await getDB();
  const results = await db.executeSql(
    `SELECT photoId FROM album_photos
     WHERE albumId = ?
     ORDER BY position ASC`,
    [albumId]
  );

  const rows = results[0].rows;
  const photoIds: string[] = [];

  for (let i = 0; i < rows.length; i++) {
    photoIds.push(rows.item(i).photoId);
  }

  return photoIds;
}

export async function reorderAlbumPhotos(
  albumId: string,
  orderedPhotoIds: string[]
): Promise<void> {
  const db = await getDB();
  await db.transaction(async (tx) => {
    for (let i = 0; i < orderedPhotoIds.length; i++) {
      tx.executeSql(
        `UPDATE album_photos
         SET position = ?
         WHERE albumId = ? AND photoId = ?`,
        [i, albumId, orderedPhotoIds[i]]
      );
    }
  });
}
