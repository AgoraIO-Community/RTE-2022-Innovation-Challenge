package io.agora.openvcall.ui;

import android.Manifest;
import android.annotation.SuppressLint;
import android.content.Context;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.location.Address;
import android.location.Geocoder;
import android.location.Location;
import android.location.LocationListener;
import android.location.LocationManager;
import android.os.Bundle;

import androidx.annotation.NonNull;
import androidx.appcompat.app.ActionBar;
import android.text.Editable;
import android.text.Layout;
import android.text.TextUtils;
import android.text.TextWatcher;
import android.util.Log;
import android.view.Menu;
import android.view.MenuInflater;
import android.view.MenuItem;
import android.view.Surface;
import android.view.TextureView;
import android.view.View;
import android.widget.AdapterView;
import android.widget.ArrayAdapter;
import android.widget.EditText;
import android.widget.FrameLayout;
import android.widget.LinearLayout;
import android.widget.Spinner;
import android.widget.Toast;

import com.serenegiant.usb.widget.CameraViewInterface;
import com.serenegiant.usb.widget.UVCCameraTextureView;

import org.json.JSONObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.BufferedReader;
import java.io.BufferedWriter;
import java.io.DataOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.io.OutputStreamWriter;
import java.net.HttpURLConnection;
import java.net.MalformedURLException;
import java.net.URL;
import java.net.URLEncoder;
import java.util.List;
import java.util.Locale;

import androidx.appcompat.app.AppCompatActivity;
import androidx.core.app.ActivityCompat;
import androidx.core.content.ContextCompat;
import io.agora.openvcall.AGApplication;
import io.agora.openvcall.R;
import io.agora.openvcall.model.ConstantApp;
import io.agora.usb.camera.USBCameraActivity;
import io.agora.usb.utils.HttpUtils;
import io.agora.usb.utils.LocationUtils;

public class MainActivity extends AppCompatActivity  {

    private final static Logger log = LoggerFactory.getLogger(MainActivity.class);
    //我的本地服务器的接口，如果在你自己的服务器上需要更改相应的url
     private String httpurl ="http://ilittleprince.com/Pilot/register.php";
    private String deviceName="add306f66b62d75e";
     private String channelName="";
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);
        if(ContextCompat.checkSelfPermission(MainActivity.this, Manifest.permission.ACCESS_FINE_LOCATION)
                != PackageManager.PERMISSION_GRANTED){//未开启定位权限
            //开启定位权限,200是标识码
            ActivityCompat.requestPermissions(MainActivity.this,new String[]{Manifest.permission.ACCESS_FINE_LOCATION},200);
        }else{
          //  initLocation();//初始化定位信息
            Toast.makeText(MainActivity.this,"已开启定位权限", Toast.LENGTH_LONG).show();
        }
        ActionBar ab = getSupportActionBar();
        if (ab != null) {
            ab.setDisplayOptions(ActionBar.DISPLAY_SHOW_CUSTOM);
            ab.setCustomView(R.layout.ard_agora_actionbar);
        }
        EditText v_channel = (EditText) findViewById(R.id.channel_name);
        v_channel.addTextChangedListener(new TextWatcher() {
            @Override
            public void beforeTextChanged(CharSequence s, int start, int count, int after) {

            }

            @Override
            public void onTextChanged(CharSequence s, int start, int before, int count) {

            }

            @Override
            public void afterTextChanged(Editable s) {
                boolean isEmpty = TextUtils.isEmpty(s.toString());
                findViewById(R.id.button_join).setEnabled(!isEmpty);
            }
        });

        Spinner encryptionSpinner = (Spinner) findViewById(R.id.encryption_mode);
        ArrayAdapter<CharSequence> adapter = ArrayAdapter.createFromResource(this,
                R.array.encryption_mode_values, R.layout.simple_spinner_item);
        adapter.setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item);
        encryptionSpinner.setAdapter(adapter);

        encryptionSpinner.setOnItemSelectedListener(new AdapterView.OnItemSelectedListener() {
            @Override
            public void onItemSelected(AdapterView<?> parent, View view, int position, long id) {
                ((AGApplication) getApplication()).userSettings().mEncryptionModeIndex = position;
            }

            @Override
            public void onNothingSelected(AdapterView<?> parent) {

            }
        });

        encryptionSpinner.setSelection(((AGApplication) getApplication()).userSettings().mEncryptionModeIndex);

        String lastChannelName = ((AGApplication) getApplication()).userSettings().mChannelName;
        if (!TextUtils.isEmpty(lastChannelName)) {
            v_channel.setText(lastChannelName);
            v_channel.setSelection(lastChannelName.length());
        }

        EditText v_encryption_key = (EditText) findViewById(R.id.encryption_key);
        String lastEncryptionKey = ((AGApplication) getApplication()).userSettings().mEncryptionKey;
        if (!TextUtils.isEmpty(lastEncryptionKey)) {
            v_encryption_key.setText(lastEncryptionKey);
        }
    }
    @Override
    public boolean onCreateOptionsMenu(final Menu menu) {
        MenuInflater inflater = getMenuInflater();
        inflater.inflate(R.menu.menu_main, menu);
        return true;
    }

    @Override
    public boolean onOptionsItemSelected(MenuItem item) {
        // Handle presses on the action bar items
        switch (item.getItemId()) {
            case R.id.action_settings:
                forwardToSettings();
                return true;
            default:
                return super.onOptionsItemSelected(item);
        }
    }

    public void onClickJoin(View view) {
        forwardToRoom();
        Location location=  initLocation();
        runOnUiThread(new Runnable() {
            @Override
            public void run() {
                try {
                  HttpUtils.AskPHP(deviceName,"18601720144",channelName,location.getLongitude(),location.getLatitude());
                } catch (IOException e) {
                    e.printStackTrace();
                }
            }
        });
    }

    public void forwardToRoom() {
        EditText v_channel = (EditText) findViewById(R.id.channel_name);
        String channel = v_channel.getText().toString();
        channelName=channel;
        ((AGApplication) getApplication()).userSettings().mChannelName = channel;

        EditText v_encryption_key = (EditText) findViewById(R.id.encryption_key);
        String encryption = v_encryption_key.getText().toString();
        ((AGApplication) getApplication()).userSettings().mEncryptionKey = encryption;

        Intent i = new Intent(MainActivity.this, CallActivity.class);
        i.putExtra(ConstantApp.ACTION_KEY_CHANNEL_NAME, channel);
        i.putExtra(ConstantApp.ACTION_KEY_ENCRYPTION_KEY, encryption);
        i.putExtra(ConstantApp.ACTION_KEY_ENCRYPTION_MODE, getResources().getStringArray(R.array.encryption_mode_values)[((AGApplication) getApplication()).userSettings().mEncryptionModeIndex]);
        startActivity(i);
        //结束
        finish();
    }

    private Location initLocation(){
        Location location = LocationUtils.getInstance( MainActivity.this ).showLocation();
        if (location != null) {
            String address = "纬度：" + location.getLatitude() + "经度：" + location.getLongitude();
            Log.e("TA",getAddress(location.getLongitude(),location.getLatitude()));
Toast.makeText(this,address,Toast.LENGTH_LONG).show();
        }else{
            Toast.makeText(this,"ERROR",Toast.LENGTH_LONG).show();
        }
        return location;
    }
    public String getAddress(double lnt, double lat) {

        Geocoder geocoder = new Geocoder(MainActivity.this);
        boolean falg = geocoder.isPresent();
        Log.e("the falg is " + falg,"the falg is ");
        StringBuilder stringBuilder = new StringBuilder();
        try {

            //根据经纬度获取地理位置信息---这里会获取最近的几组地址信息，具体几组由最后一个参数决定
            List<Address> addresses = geocoder.getFromLocation(lat, lnt, 1);

            if (addresses.size() > 0) {
                Address address = addresses.get(0);
                for (int i = 0; i < address.getMaxAddressLineIndex(); i++) {
                    //每一组地址里面还会有许多地址。这里我取的前2个地址。xxx街道-xxx位置
                    if (i == 0) {
                        stringBuilder.append(address.getAddressLine(i)).append("-");
                    }

                    if (i == 1) {
                        stringBuilder.append(address.getAddressLine(i));
                        break;
                    }
                }
                //stringBuilder.append(address.getCountryName()).append("");//国家
                stringBuilder.append(address.getAdminArea()).append("");//省份
                stringBuilder.append(address.getLocality()).append("");//市
                stringBuilder.append(address.getFeatureName()).append("");//周边地址

//                stringBuilder.append(address.getCountryCode()).append("_");//国家编码
//                stringBuilder.append(address.getThoroughfare()).append("_");//道路
                Log.d("thistt", "地址信息--->" + stringBuilder);
            }
        } catch (Exception e) {
            Log.d("获取经纬度地址异常","");
            e.printStackTrace();
        }
        return stringBuilder.toString();

    }


    public void forwardToSettings() {
        Intent i = new Intent(this, SettingsActivity.class);
        startActivity(i);
    }


}
