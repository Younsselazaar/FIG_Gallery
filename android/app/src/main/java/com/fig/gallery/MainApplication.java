package com.fig.gallery;

import android.app.Application;

import com.facebook.react.PackageList;
import com.facebook.soloader.SoLoader;
import com.facebook.react.ReactApplication;
import com.facebook.react.ReactNativeHost;
import com.facebook.react.ReactPackage;
import com.facebook.react.defaults.DefaultReactNativeHost;

import java.util.List;

/**
 * MainApplication
 * ----------------
 * System-level Application class for FIG Gallery.
 *
 * Locked for:
 * - React Native 0.73.x
 * - Android 11–13
 * - Hermes ENABLED
 * - New Architecture DISABLED
 * - Offline-first gallery
 */
public class MainApplication extends Application implements ReactApplication {

    private final ReactNativeHost mReactNativeHost =
            new DefaultReactNativeHost(this) {

                @Override
                public boolean getUseDeveloperSupport() {
                    // Always false for FIG builds
                    return false;
                }

                @Override
                protected List<ReactPackage> getPackages() {
                    List<ReactPackage> packages = new PackageList(this).getPackages();
                    // No manual packages required
                    return packages;
                }

                @Override
                protected String getJSMainModuleName() {
                    // MUST match react.entryFile in app/build.gradle
                    return "src/index";
                }

                @Override
                protected boolean isNewArchEnabled() {
                    // LOCKED — do not enable
                    return false;
                }

                @Override
                protected Boolean isHermesEnabled() {
                    return true;
                }
            };

    @Override
    public ReactNativeHost getReactNativeHost() {
        return mReactNativeHost;
    }

    @Override
    public void onCreate() {
        super.onCreate();
        SoLoader.init(this, false);
    }
}
