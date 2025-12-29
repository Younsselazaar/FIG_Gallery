/**
 * metro.config.js
 * ----------------
 * FIG Gallery Metro configuration
 *
 * Locked for:
 * - React Native 0.73.x
 * - TypeScript
 * - SVG icons as components
 * - Stable performance on 3.5" FIG phones
 */

const { getDefaultConfig, mergeConfig } = require("@react-native/metro-config");

const defaultConfig = getDefaultConfig(__dirname);

module.exports = mergeConfig(defaultConfig, {
  transformer: {
    getTransformOptions: async () => ({
      transform: {
        experimentalImportSupport: false,
        inlineRequires: true, // performance boost
      },
    }),
  },
  resolver: {
    sourceExts: [...defaultConfig.resolver.sourceExts, "cjs"],
  },
});
