package io.agora.metachat.example;

import android.app.Application;

public class MainApplication extends Application {

    public static MainApplication instance;

    @Override
    public void onCreate() {
        super.onCreate();
        instance = this;
    }

}
