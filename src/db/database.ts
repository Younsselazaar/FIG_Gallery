import SQLite from "react-native-sqlite-storage";

/**
 * database.ts
 * -----------
 * Central SQLite database for FIG Gallery.
 *
 * Rules:
 * - Offline-first
 * - Single shared connection
 * - Safe for thousands of photos
 * - Android 11–13 compatible
 * - No encryption assumptions
 */

SQLite.enablePromise(true);

const DB_NAME = "fig_gallery.db";
const DB_LOCATION = "default";

let dbInstance: SQLite.SQLiteDatabase | null = null;

/**
 * Get the database instance.
 * Returns the opened database connection.
 */
export async function getDB(): Promise<SQLite.SQLiteDatabase> {
  if (!dbInstance) {
    dbInstance = await SQLite.openDatabase({
      name: DB_NAME,
      location: DB_LOCATION,
    });
  }
  return dbInstance;
}

/**
 * Initialize database schema.
 * MUST be called once on app startup.
 */
export async function initDatabase(): Promise<void> {
  const database = await getDB();

  await database.transaction(async (tx) => {
    // Photos table
    tx.executeSql(`
      CREATE TABLE IF NOT EXISTS photos (
        id TEXT PRIMARY KEY NOT NULL,
        uri TEXT NOT NULL,
        createdAt INTEGER,
        modifiedAt INTEGER,
        favorite INTEGER DEFAULT 0,
        hidden INTEGER DEFAULT 0,
        archived INTEGER DEFAULT 0,
        trashed INTEGER DEFAULT 0
      );
    `);

    // Add archived column if it doesn't exist (migration for existing databases)
    tx.executeSql(`
      ALTER TABLE photos ADD COLUMN archived INTEGER DEFAULT 0;
    `);

    // Albums table
    tx.executeSql(`
      CREATE TABLE IF NOT EXISTS albums (
        id TEXT PRIMARY KEY NOT NULL,
        name TEXT NOT NULL,
        description TEXT,
        createdAt INTEGER
      );
    `);

    // Album ↔ Photo join table
    tx.executeSql(`
      CREATE TABLE IF NOT EXISTS album_photos (
        albumId TEXT NOT NULL,
        photoId TEXT NOT NULL,
        position INTEGER DEFAULT 0,
        PRIMARY KEY (albumId, photoId)
      );
    `);

    // Edit history table
    tx.executeSql(`
      CREATE TABLE IF NOT EXISTS edits (
        id TEXT PRIMARY KEY NOT NULL,
        photoId TEXT NOT NULL,
        type TEXT NOT NULL,
        payload TEXT,
        createdAt INTEGER
      );
    `);

    // Sync queue (future / disabled backend)
    tx.executeSql(`
      CREATE TABLE IF NOT EXISTS sync_queue (
        id TEXT PRIMARY KEY NOT NULL,
        entityType TEXT NOT NULL,
        entityId TEXT NOT NULL,
        action TEXT NOT NULL,
        payload TEXT,
        createdAt INTEGER
      );
    `);
  });
}
