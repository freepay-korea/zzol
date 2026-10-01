package com.zzol.app;

import android.os.Build;
import android.os.Bundle;
import android.view.View;
import android.view.WindowManager;
import androidx.core.view.WindowCompat;
import androidx.core.view.WindowInsetsCompat;
import androidx.core.view.WindowInsetsControllerCompat;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        enableImmersiveMode();
    }

    @Override
    public void onResume() {
        super.onResume();
        enableImmersiveMode();
    }

    @Override
    public void onWindowFocusChanged(boolean hasFocus) {
        super.onWindowFocusChanged(hasFocus);
        if (hasFocus) {
            enableImmersiveMode();
        }
    }

    private void enableImmersiveMode() {
        try {
            // Keep screen on while playing
            getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);

            WindowCompat.setDecorFitsSystemWindows(getWindow(), false);
            WindowInsetsControllerCompat controller = new WindowInsetsControllerCompat(getWindow(), getWindow().getDecorView());
            
            // Hide both status bar and navigation bar (quick launch / soft keys)
            controller.hide(WindowInsetsCompat.Type.systemBars());
            
            // Sticky immersive: only swipe from edge temporarily reveals bars without disrupting touch game
            controller.setSystemBarsBehavior(WindowInsetsControllerCompat.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE);

            // Backward compatibility for Android 10 and below
            if (Build.VERSION.SDK_INT < Build.VERSION_CODES.R) {
                View decorView = getWindow().getDecorView();
                decorView.setSystemUiVisibility(
                    View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY
                    | View.SYSTEM_UI_FLAG_LAYOUT_STABLE
                    | View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION
                    | View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN
                    | View.SYSTEM_UI_FLAG_HIDE_NAVIGATION
                    | View.SYSTEM_UI_FLAG_FULLSCREEN
                );
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
