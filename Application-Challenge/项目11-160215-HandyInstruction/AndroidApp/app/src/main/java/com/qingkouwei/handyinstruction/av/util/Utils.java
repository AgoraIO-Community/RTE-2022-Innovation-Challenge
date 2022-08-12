package com.qingkouwei.handyinstruction.av.util;

import android.content.Context;
import android.os.Build;
import android.os.Environment;
import java.io.File;

public class Utils {
  public static boolean isAndroidN() {
    return Build.VERSION.SDK_INT >= Build.VERSION_CODES.N;
  }

  public static File getSnapshotDir(Context context) {
    File file = new File(Environment.getExternalStorageDirectory().getPath() + "/osn/snapshot");
    if (!file.exists()) {
      file.mkdirs();
    }
    return file;
  }
}
