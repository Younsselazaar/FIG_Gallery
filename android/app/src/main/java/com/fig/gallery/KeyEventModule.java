package com.fig.gallery;

import android.util.Log;
import android.view.KeyEvent;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.module.annotations.ReactModule;
import com.facebook.react.modules.core.DeviceEventManagerModule;

import javax.annotation.Nullable;

/**
 * KeyEventModule
 * --------------
 * Native module to send Android key events to React Native JavaScript.
 * Enables D-pad / keypad navigation in the gallery app.
 */
@ReactModule(name = KeyEventModule.NAME)
public class KeyEventModule extends ReactContextBaseJavaModule {
    public static final String NAME = "KeyEventModule";
    private static ReactApplicationContext reactContext;
    private static KeyEventModule instance;

    public KeyEventModule(ReactApplicationContext context) {
        super(context);
        reactContext = context;
        instance = this;
        Log.i("KeyEventModule", "KeyEventModule instantiated!");
    }

    @Override
    public String getName() {
        return NAME;
    }

    public static KeyEventModule getInstance() {
        return instance;
    }

    public static void sendKeyEvent(int keyCode, int action) {
        if (reactContext == null || !reactContext.hasActiveReactInstance()) {
            return;
        }

        WritableMap params = Arguments.createMap();
        params.putInt("keyCode", keyCode);
        params.putInt("action", action);

        reactContext
            .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
            .emit("onKeyDown", params);
    }

    // Required for NativeEventEmitter
    @ReactMethod
    public void addListener(String eventName) {
        // Required for RN built-in Event Emitter
    }

    // Required for NativeEventEmitter
    @ReactMethod
    public void removeListeners(int count) {
        // Required for RN built-in Event Emitter
    }
}
