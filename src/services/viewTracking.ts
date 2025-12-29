import AsyncStorage from "@react-native-async-storage/async-storage";

/**
 * viewTracking.ts
 * ---------------
 * Tracks recently viewed and most viewed photos using AsyncStorage.
 *
 * Storage keys:
 * - recentlyViewedPhotos: Array of photo IDs, ordered from most recent to oldest (max 25)
 * - photoViewCounts: Object with photo IDs as keys and view counts as values
 */

const RECENTLY_VIEWED_KEY = "recentlyViewedPhotos";
const VIEW_COUNTS_KEY = "photoViewCounts";
const MAX_RECENTLY_VIEWED = 25;

// Get recently viewed photo IDs
export async function getRecentlyViewedIds(): Promise<string[]> {
  try {
    const data = await AsyncStorage.getItem(RECENTLY_VIEWED_KEY);
    if (data) {
      return JSON.parse(data);
    }
    return [];
  } catch (error) {
    console.error("Error getting recently viewed:", error);
    return [];
  }
}

// Get view counts for all photos
export async function getViewCounts(): Promise<Record<string, number>> {
  try {
    const data = await AsyncStorage.getItem(VIEW_COUNTS_KEY);
    if (data) {
      return JSON.parse(data);
    }
    return {};
  } catch (error) {
    console.error("Error getting view counts:", error);
    return {};
  }
}

// Track a photo view - call this when a photo is opened in the viewer
export async function trackPhotoView(photoId: string): Promise<void> {
  try {
    // Update recently viewed
    const recentlyViewed = await getRecentlyViewedIds();

    // Remove existing entry for this photo (to prevent duplicates)
    const filtered = recentlyViewed.filter((id) => id !== photoId);

    // Add to beginning of array
    filtered.unshift(photoId);

    // Trim to max size
    const trimmed = filtered.slice(0, MAX_RECENTLY_VIEWED);

    // Save back
    await AsyncStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify(trimmed));

    // Update view count
    const viewCounts = await getViewCounts();
    viewCounts[photoId] = (viewCounts[photoId] || 0) + 1;
    await AsyncStorage.setItem(VIEW_COUNTS_KEY, JSON.stringify(viewCounts));
  } catch (error) {
    console.error("Error tracking photo view:", error);
  }
}

// Get most viewed photo IDs sorted by view count (descending)
export async function getMostViewedIds(limit: number = 25): Promise<string[]> {
  try {
    const viewCounts = await getViewCounts();

    // Convert to array and sort by count (descending)
    const sorted = Object.entries(viewCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([id]) => id);

    return sorted;
  } catch (error) {
    console.error("Error getting most viewed:", error);
    return [];
  }
}

// Clear all view tracking data (for testing/reset)
export async function clearViewTracking(): Promise<void> {
  try {
    await AsyncStorage.multiRemove([RECENTLY_VIEWED_KEY, VIEW_COUNTS_KEY]);
  } catch (error) {
    console.error("Error clearing view tracking:", error);
  }
}
