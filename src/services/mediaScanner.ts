import { Platform, PermissionsAndroid } from "react-native";
import { CameraRoll } from "@react-native-camera-roll/camera-roll";
import { getDB } from "../db/database";

/**
 * mediaScanner.ts
 * ---------------
 * Scans device photos and syncs to local SQLite database.
 *
 * Handles:
 * - Runtime permission requests (Android 13+ and legacy)
 * - Incremental photo scanning
 * - Database sync
 */

export async function requestMediaPermission(): Promise<boolean> {
  if (Platform.OS !== "android") {
    return true;
  }

  try {
    // Android 13+ uses READ_MEDIA_IMAGES
    if (Platform.Version >= 33) {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES,
        {
          title: "Photo Access Required",
          message: "Gallery needs access to your photos to display them.",
          buttonPositive: "Allow",
          buttonNegative: "Deny",
        }
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    } else {
      // Android 12 and below
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
        {
          title: "Storage Access Required",
          message: "Gallery needs access to your photos to display them.",
          buttonPositive: "Allow",
          buttonNegative: "Deny",
        }
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    }
  } catch (err) {
    console.warn("Permission request error:", err);
    return false;
  }
}

export async function scanDevicePhotos(): Promise<number> {
  const hasPermission = await requestMediaPermission();
  if (!hasPermission) {
    console.log("Media permission denied");
    return 0;
  }

  let totalScanned = 0;
  let hasMore = true;
  let endCursor: string | undefined;

  try {
    const db = await getDB();

    while (hasMore) {
      const result = await CameraRoll.getPhotos({
        first: 100,
        after: endCursor,
        assetType: "All",
        include: ["filename", "fileSize", "imageSize"],
      });

      for (const edge of result.edges) {
        const node = edge.node;
        const uri = node.image.uri;
        const id = uri; // Use URI as unique ID
        const createdAt = node.timestamp ? node.timestamp * 1000 : Date.now();

        // Insert or ignore if already exists
        await db.executeSql(
          `INSERT OR IGNORE INTO photos
            (id, uri, createdAt, modifiedAt, favorite, hidden, trashed)
           VALUES (?, ?, ?, ?, 0, 0, 0)`,
          [id, uri, createdAt, createdAt]
        );

        totalScanned++;
      }

      hasMore = result.page_info.has_next_page;
      endCursor = result.page_info.end_cursor;
    }

    console.log(`Scanned ${totalScanned} photos`);
    return totalScanned;
  } catch (err) {
    console.error("Error scanning photos:", err);
    return totalScanned;
  }
}
