package com.fig.gallery;

import android.util.Log;

import com.facebook.react.ReactPackage;
import com.facebook.react.bridge.NativeModule;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.uimanager.ViewManager;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

/**
 * KeyEventPackage
 * ---------------
 * Registers KeyEventModule with React Native.
 */
public class KeyEventPackage implements ReactPackage {
    @Override
    public List<NativeModule> createNativeModules(ReactApplicationContext reactContext) {
        Log.i("KeyEventPackage", "createNativeModules called!");
        List<NativeModule> modules = new ArrayList<>();
        modules.add(new KeyEventModule(reactContext));
        Log.i("KeyEventPackage", "KeyEventModule added to modules list");
        return modules;
    }

    @Override
    public List<ViewManager> createViewManagers(ReactApplicationContext reactContext) {
        return Collections.emptyList();
    }
}
