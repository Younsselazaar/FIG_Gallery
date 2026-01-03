package com.fig.gallery;

import android.os.Bundle;
import android.view.KeyEvent;

import com.facebook.react.ReactActivity;
import com.facebook.react.ReactActivityDelegate;
import com.facebook.react.defaults.DefaultReactActivityDelegate;

/**
 * MainActivity
 * ------------
 * Entry point for FIG Gallery React Native app.
 *
 * Locked for:
 * - Android 11–13
 * - 3.5" FIG phones
 * - Touch + keypad (DPAD)
 * - New Architecture DISABLED
 */
public class MainActivity extends ReactActivity {

    @Override
    protected String getMainComponentName() {
        // MUST match AppRegistry.registerComponent(...)
        return "FigGallery";
    }

    @Override
    protected ReactActivityDelegate createReactActivityDelegate() {
        return new DefaultReactActivityDelegate(
                this,
                getMainComponentName(),
                false // newArchEnabled = false (LOCKED)
        );
    }

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        // Pass null to avoid state restoration issues
        super.onCreate(null);
    }

    /**
     * Allow hardware key events (DPAD / keypad)
     * to flow through to React Native.
     */
    @Override
    public boolean dispatchKeyEvent(KeyEvent event) {
        // Send DPAD key down events to React Native (only first press, not repeats)
        if (event.getAction() == KeyEvent.ACTION_DOWN && event.getRepeatCount() == 0) {
            int keyCode = event.getKeyCode();
            // Handle DPAD keys (19-23), Enter (66), and Numpad Enter (160)
            if ((keyCode >= KeyEvent.KEYCODE_DPAD_UP && keyCode <= KeyEvent.KEYCODE_DPAD_CENTER) ||
                keyCode == KeyEvent.KEYCODE_ENTER ||
                keyCode == KeyEvent.KEYCODE_NUMPAD_ENTER) {
                KeyEventModule.sendKeyEvent(keyCode, event.getAction());
            }
        }
        return super.dispatchKeyEvent(event);
    }
}
