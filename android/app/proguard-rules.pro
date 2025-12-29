##
## FIG Gallery — ProGuard / R8 Rules
##
## Locked for:
## - React Native 0.73.x
## - Hermes enabled
## - New Architecture disabled
## - Android 11–13
## - Offline-first gallery app
##

# ============================================================
# React Native core
# ============================================================

-keep class com.facebook.react.** { *; }
-dontwarn com.facebook.react.**

# ============================================================
# Hermes
# ============================================================

-keep class com.facebook.hermes.** { *; }
-dontwarn com.facebook.hermes.**

# ============================================================
# JavaScript interfaces (React Native bridge)
# ============================================================

-keepclassmembers class * {
    @com.facebook.react.bridge.ReactMethod <methods>;
}

-keepattributes *Annotation*

# ============================================================
# Kotlin metadata (avoid reflection crashes)
# ============================================================

-keep class kotlin.Metadata { *; }
-dontwarn kotlin.**

# ============================================================
# SQLite / storage (used for offline gallery DB)
# ============================================================

-keep class net.sqlcipher.** { *; }
-dontwarn net.sqlcipher.**

# react-native-sqlite-storage
-keep class org.pgsqlite.** { *; }
-dontwarn org.pgsqlite.**

# ============================================================
# SVG (react-native-svg)
# ============================================================

-keep class com.horcrux.svg.** { *; }
-dontwarn com.horcrux.svg.**

# ============================================================
# Remove logs in release builds
# ============================================================

-assumenosideeffects class android.util.Log {
    public static *** d(...);
    public static *** v(...);
    public static *** i(...);
}

# ============================================================
# Safety: do NOT strip app entry points
# ============================================================

-keep class com.fig.gallery.MainActivity { *; }
-keep class com.fig.gallery.MainApplication { *; }

# ============================================================
# General safety
# ============================================================

-dontoptimize
