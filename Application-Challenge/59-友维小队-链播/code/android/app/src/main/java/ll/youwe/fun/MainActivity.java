package ll.youwe.fun;

import android.os.Build;
import android.os.Bundle;

import com.getcapacitor.BridgeActivity;
import androidx.annotation.RequiresApi;

public class MainActivity extends BridgeActivity {

  @RequiresApi(api = Build.VERSION_CODES.M)
  @Override
  protected void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);
  }
}
