package baiduMap;

/*
	author by:2432655389@qq.com
	商业合作请联系author
	非商业化使用请标明出处
	内有百度地图和agora的sdk的授权ak
	短时间内试用还ok，时间长了估计免费额度就over了
	长时间请替换成自己的授权ak
*/

import android.content.Intent;
import android.os.Bundle;
import android.text.TextUtils;
import android.view.View;
import android.widget.Button;
import android.widget.EditText;
import android.widget.TextView;
import android.widget.Toast;

import androidx.annotation.Nullable;
import androidx.lifecycle.Observer;

import com.baidu.location.BDAbstractLocationListener;
import com.baidu.location.BDLocation;
import com.baidu.location.LocationClient;
import com.baidu.location.LocationClientOption;
import com.baidu.mapapi.map.BaiduMap;
import com.baidu.mapapi.map.BitmapDescriptor;
import com.baidu.mapapi.map.BitmapDescriptorFactory;
import com.baidu.mapapi.map.MapStatusUpdate;
import com.baidu.mapapi.map.MapStatusUpdateFactory;
import com.baidu.mapapi.map.MapView;
import com.baidu.mapapi.map.Marker;
import com.baidu.mapapi.map.MarkerOptions;
import com.baidu.mapapi.map.OverlayOptions;
import com.baidu.mapapi.model.LatLng;
import com.baidu.mapapi.model.LatLngBounds;
import com.baidu.mapapi.search.core.PoiInfo;
import com.baidu.mapapi.search.core.SearchResult;
import com.baidu.mapapi.search.geocode.GeoCodeResult;
import com.baidu.mapapi.search.geocode.GeoCoder;
import com.baidu.mapapi.search.geocode.OnGetGeoCoderResultListener;
import com.baidu.mapapi.search.geocode.ReverseGeoCodeOption;
import com.baidu.mapapi.search.geocode.ReverseGeoCodeResult;
import com.baidu.mapapi.utils.DistanceUtil;
import com.example.integrated_version.R;

import java.util.List;

import agora.agora_MainActivity;


public class baiduMapMainActivity extends CheckPermissionsActivity implements OnGetGeoCoderResultListener,View.OnClickListener {

    private GeoCoder mSearch = null;

    private MapView mMapView;
    private BaiduMap mBaiduMap;
    private TextView mOneLocTV;
    private TextView mContinuoueLocTV;
    private boolean isFirstLoc = true;
    private int mCount = 0;
    private LocationClient mLocClientOne = null;
    private LocationClient mLocClientContinuoue = null;
    private Button mOneLocationBt;
    private Button mContinuoueLocaionBt;
    private BitmapDescriptor mBitmapRed = BitmapDescriptorFactory.fromResource(R.drawable.marker);
    private BitmapDescriptor mBitmapBlue = BitmapDescriptorFactory.fromResource(R.drawable.markerblue);
    private Marker mContinuoueLocMarker = null;
    private Marker mOneLocMarker = null;

    private EditText m_shu_ru;
    private Button m_an_jian,m_an_jian2;
    private TextView m_xian_shi;
    public String sss="mo ren wei kong";
    public String phone;

    public static String localJingDu="",localWeiDu="";
    private static double remoteJingDu,remoteWeidu;
    @Override
    protected void onCreate(@Nullable Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_baidu_map_main);
        mOneLocationBt = findViewById(R.id.one_location);
        mOneLocTV = findViewById(R.id.one_loc_tv);
        mContinuoueLocaionBt = findViewById(R.id.continuous_location);
        mContinuoueLocTV = findViewById(R.id.continuoue_loc_tv);
        mMapView = findViewById(R.id.map_view);
        mMapView.showZoomControls(false);
        mBaiduMap = mMapView.getMap();
        mOneLocationBt.setOnClickListener(this);
        mContinuoueLocaionBt.setOnClickListener(this);

        m_shu_ru=findViewById(R.id.shu_ru);
        m_xian_shi=findViewById(R.id.xian_shi);
        m_an_jian=findViewById(R.id.an_jian);
        m_an_jian2=findViewById(R.id.an_jian2);


        m_an_jian.setOnClickListener(this);
        m_an_jian2.setOnClickListener(this);

        LatLng point = new LatLng(115.213044, 36.078579);
        BitmapDescriptor bitmap = BitmapDescriptorFactory
                .fromResource(R.drawable.markerblue);
        OverlayOptions option = new MarkerOptions()
                .position(point)
                .icon(bitmap);
        mBaiduMap.addOverlay(option);
        LiveDataBusBeta.getInstance()
                .with("key_MainActivity",String.class)
                .observe(this, new Observer<String>() {
                            @Override
                            public void onChanged(String s) {
                                m_xian_shi.setText(s);
                                String[] arrayStr=s.split("_");
                                if(arrayStr.length==2) {
                                    remoteJingDu = Double.parseDouble(arrayStr[0]);
                                    remoteWeidu = Double.parseDouble(arrayStr[1]);
                                }
                                else{
                                    remoteJingDu=0;
                                    remoteWeidu=0;
                                }
                            }
                        }
                );

    }

    @Override
    public void onClick(View v) {
        switch (v.getId()) {
            case R.id.one_location:
                String startStr = getResources().getString(R.string.start_one_Loc);
                String stopStr = getResources().getString(R.string.stop_one_Loc);
                if (mOneLocationBt.getText().equals(startStr)) {
                    startOneLocaton();
                    mOneLocationBt.setText(stopStr);

                } else {
                    stopOneLocaton();
                    double distance=calculateDistance();
                    if(distance==-1){
                        m_shu_ru.setText("未获取本地信息");
                    }
                    else if(distance==-2){
                        m_shu_ru.setText("未获取远端信息");
                    }
                    else{
                        m_shu_ru.setText("距离："+distance+"米");
                    }

                    mOneLocationBt.setText(startStr);

                }
                break;
            case R.id.continuous_location:
                String startContinueStr = getResources().getString(R.string.start_continue_Loc);
                String stopContinueStr = getResources().getString(R.string.stop_continue_Loc);
                if (mContinuoueLocaionBt.getText().equals(startContinueStr)) {
                    startContinuoueLocaton();
                    mContinuoueLocaionBt.setText(stopContinueStr);
                } else {
                    stopContinuoueLocaton();
                    mContinuoueLocaionBt.setText(startContinueStr);
                }
                break;
            case R.id.an_jian:
                yiDongTu();
                break;
            case R.id.an_jian2:
                if(localJingDu.isEmpty()||localWeiDu.isEmpty()){
                    m_shu_ru.setText("没有获取本地经纬度，无法发送");
                }
                else {
                    LiveDataBusBeta
                            .getInstance()
                            .with("baiduMap", String.class)
                            .setValue(localJingDu+"_"+localWeiDu);
                    m_shu_ru.setText("经度:"+localJingDu+"纬度："+localWeiDu);
                    Intent intent = new Intent(baiduMapMainActivity.this, agora_MainActivity.class);
                    startActivity(intent);
                }
                break;
                default:
                    break;
            }

    }
    private double calculateDistance(){
        if(localJingDu.isEmpty()||localWeiDu.isEmpty()){
            return -1;
        }
        if(remoteJingDu==0||remoteWeidu==0){
            return -2;
        }
        double localJingDuD=Double.parseDouble(localJingDu);
        double localWeiDuD=Double.parseDouble(localWeiDu);
        return DistanceUtil.getDistance(new LatLng(localJingDuD,localWeiDuD),new LatLng(remoteJingDu,remoteWeidu));
    }
    private void yiDongTu(){
        LatLng point;
        if(remoteJingDu!=0&&remoteWeidu!=0){
            point = new LatLng(remoteJingDu,remoteWeidu);
        }
        else {
            Toast.makeText(this, "经纬度错误", Toast.LENGTH_LONG).show();
            point = new LatLng(36.078579, 115.213044);//默认的南乐一中的位置
        }
        BitmapDescriptor bitmap = BitmapDescriptorFactory
                .fromResource(R.drawable.markerblue);
        OverlayOptions option = new MarkerOptions()
                .position(point)
                .icon(bitmap)
                .draggable(true)
                .flat(true)
                .alpha(0.5f);
        LatLngBounds.Builder builder = new LatLngBounds.Builder();
        builder.include(point);
        int padding = 0;
        int paddingBottom = 600;
        MapStatusUpdate mapStatusUpdate = MapStatusUpdateFactory.newLatLngBounds(builder.build(), padding,
                padding, padding, paddingBottom);
        mBaiduMap.animateMapStatus(mapStatusUpdate);

        mBaiduMap.addOverlay(option);
        GeoCoder mSearch = GeoCoder.newInstance();
        mSearch.setOnGetGeoCodeResultListener((OnGetGeoCoderResultListener) this);
        ReverseGeoCodeOption reverseGeoCodeOption = new ReverseGeoCodeOption()
                .location(point)
                .newVersion(1)
                .radius(50)
                .pageNum(0);
        mSearch.reverseGeoCode(reverseGeoCodeOption);
    }



    private void startOneLocaton() {
        mLocClientOne = new LocationClient(this);
        mLocClientOne.registerLocationListener(oneLocationListener);
        LocationClientOption locationClientOption = new LocationClientOption();
        locationClientOption.setLocationMode(LocationClientOption.LocationMode.Hight_Accuracy);
        locationClientOption.setNeedDeviceDirect(true);
        locationClientOption.setCoorType("bd09ll");
        locationClientOption.setScanSpan(0);
        locationClientOption.setOnceLocation(false);
        locationClientOption.setOpenGps(true);
        locationClientOption.setIsNeedAddress(true);
        locationClientOption.setIsNeedLocationPoiList(true);
        locationClientOption.setNeedDeviceDirect(true);
        mLocClientOne.setLocOption(locationClientOption);
        mLocClientOne.start();
    }

    private void stopOneLocaton() {
        if (null != mLocClientOne) {
            mLocClientOne.stop();
        }
    }


    private void startContinuoueLocaton() {

        mLocClientContinuoue = new LocationClient(this);
        mLocClientContinuoue.registerLocationListener(continuoueLocationListener);
        LocationClientOption locationClientOption = new LocationClientOption();
        locationClientOption.setNeedDeviceDirect(true);
        locationClientOption.setLocationMode(LocationClientOption.LocationMode.Hight_Accuracy);
        locationClientOption.setCoorType("bd09ll");
        locationClientOption.setScanSpan(1000);
        locationClientOption.setOpenGps(true);
        locationClientOption.setIsNeedAddress(true);
        locationClientOption.setIsNeedLocationPoiList(true);

        mLocClientContinuoue.setLocOption(locationClientOption);
        mLocClientContinuoue.start();
    }


    private void stopContinuoueLocaton() {
        if (null != mLocClientContinuoue) {
            mLocClientContinuoue.stop();
            isFirstLoc = true;
        }
    }


    private void addContinuoueLocMarker(LatLng latLng) {
        if (null != mContinuoueLocMarker) {
            mContinuoueLocMarker.remove();
        }
        MarkerOptions markerOptions = new MarkerOptions();
        markerOptions.position(latLng);
        markerOptions.icon(mBitmapRed);
        mContinuoueLocMarker = (Marker) mBaiduMap.addOverlay(markerOptions);
    }


    private void addOneLocMarker(LatLng latLng) {
        if (null != mOneLocMarker) {
            mOneLocMarker.remove();
        }
        MarkerOptions markerOptions = new MarkerOptions();
        markerOptions.position(latLng);
        markerOptions.icon(mBitmapBlue);
        mOneLocMarker = (Marker) mBaiduMap.addOverlay(markerOptions);
    }
    @Override
    protected void onResume() {
        super.onResume();
        mMapView.onResume();
    }

    @Override
    protected void onPause() {
        super.onPause();
        mMapView.onPause();
    }

    @Override
    protected void onDestroy() {
        super.onDestroy();
        stopContinuoueLocaton();
        stopOneLocaton();
        mBitmapRed.recycle();
        mBaiduMap.clear();
        mMapView.onDestroy();
    }


    private BDAbstractLocationListener oneLocationListener = new BDAbstractLocationListener() {

        /**
         * 定位请求回调函数
         * @param location 定位结果
         */
        @Override
        public void onReceiveLocation(BDLocation location) {
            if (null == location || null == mBaiduMap) {
                return;
            }
            LatLng latLng = new LatLng(location.getLatitude(), location.getLongitude());
            localJingDu=String.valueOf(location.getLatitude());
            localWeiDu=String.valueOf(location.getLongitude());
            m_shu_ru.setText("经度:"+localJingDu+"纬度："+localWeiDu);
            addOneLocMarker(latLng);
            LatLngBounds.Builder builder = new LatLngBounds.Builder();
            builder.include(latLng);
            int padding = 0;
            int paddingBottom = 600;
            MapStatusUpdate mapStatusUpdate = MapStatusUpdateFactory.newLatLngBounds(builder.build(), padding,
                    padding, padding, paddingBottom);
            StringBuffer sb = new StringBuffer(256);
            mBaiduMap.animateMapStatus(mapStatusUpdate);
            if (location.getLocType() == BDLocation.TypeGpsLocation) {// GPS定位结果
                sb.append("gps定位成功");
            } else if (location.getLocType() == BDLocation.TypeNetWorkLocation) {// 网络定位结果
                sb.append("网络定位成功");
            } else if (location.getLocType() == BDLocation.TypeOffLineLocation) {// 离线定位结果
                sb.append("离线定位成功");
            } else if (location.getLocType() == BDLocation.TypeServerError) {
                sb.append("服务端网络定位失败");
            } else if (location.getLocType() == BDLocation.TypeNetWorkException) {
                sb.append("网络不同导致定位失败，请检查网络是否通畅");
            } else if (location.getLocType() == BDLocation.TypeCriteriaException) {
                sb.append("无法获取有效定位依据导致定位失败，一般是由于手机的原因，处于飞行模式下一般会造成这种结果，可以试着重启手机");
            }
            String locationStr = Utils.getLocationStr(location, mLocClientOne);
            sss=locationStr;
            if (!TextUtils.isEmpty(locationStr)) {
                sb.append(locationStr);
            }
            if (null != mOneLocTV) {
                mOneLocTV.setText(sb.toString());
            }
        }
    };



    private BDAbstractLocationListener continuoueLocationListener = new BDAbstractLocationListener() {

        /**
         * 定位请求回调函数
         * @param location 定位结果
         */
        @Override
        public void onReceiveLocation(BDLocation location) {
            if (null == location || null == mBaiduMap) {
                return;
            }
            LatLng latLng = new LatLng(location.getLatitude(), location.getLongitude());
            String jingdu,weidu;
            jingdu= String.valueOf(location.getLatitude());
            weidu=String.valueOf(location.getLongitude());
            if (isFirstLoc) {
                addContinuoueLocMarker(latLng);
                LatLngBounds.Builder builder = new LatLngBounds.Builder();
                builder.include(latLng);
                int padding = 0;
                int paddingBottom = 600;
                MapStatusUpdate mapStatusUpdate = MapStatusUpdateFactory.newLatLngBounds(builder.build(), padding,
                        padding, padding, paddingBottom);
                mBaiduMap.animateMapStatus(mapStatusUpdate);
                isFirstLoc = false;
            }
            mContinuoueLocMarker.setPosition(latLng);
            StringBuffer sb = new StringBuffer(256);
            if (location.getLocType() == BDLocation.TypeGpsLocation) {// GPS定位结果
                sb.append("gps定位成功");
            } else if (location.getLocType() == BDLocation.TypeNetWorkLocation) {// 网络定位结果
                sb.append("网络定位成功");
            } else if (location.getLocType() == BDLocation.TypeOffLineLocation) {// 离线定位结果
                sb.append("离线定位成功");
            } else if (location.getLocType() == BDLocation.TypeServerError) {
                sb.append("服务端网络定位失败");
            } else if (location.getLocType() == BDLocation.TypeNetWorkException) {
                sb.append("网络不同导致定位失败，请检查网络是否通畅");
            } else if (location.getLocType() == BDLocation.TypeCriteriaException) {
                sb.append("无法获取有效定位依据导致定位失败，一般是由于手机的原因，处于飞行模式下一般会造成这种结果，可以试着重启手机");
            }
            sb.append("\n连续定位次数 : ");
            sb.append(mCount ++);
            String locationStr = Utils.getLocationStr(location,mLocClientContinuoue);
            if (!TextUtils.isEmpty(locationStr)) {
                sb.append(locationStr);
            }
            if (null != mContinuoueLocTV){
                mContinuoueLocTV.setText(sb.toString());
            }
        }
    };

    @Override
    public void onGetGeoCodeResult(GeoCodeResult geoCodeResult) {

    }

    @Override
    public void onGetReverseGeoCodeResult(ReverseGeoCodeResult result) {
        if (result == null || result.error != SearchResult.ERRORNO.NO_ERROR) {
            Toast.makeText(baiduMapMainActivity.this, "抱歉，未能找到结果", Toast.LENGTH_LONG).show();
            return;
        }
        List<PoiInfo> poiList = result.getPoiList();
        if (null != poiList && poiList.size() > 0) {
            StringBuffer sb = new StringBuffer();
            for (int i=0;i<poiList.size();i++) {
                sb.append(poiList.get(i).getName() + ",");
                sb.append(poiList.get(i).getAddress() + ",");
                sb.append(poiList.get(i).getCity() + ",");
                sb.append(poiList.get(i).getParentPoi().getParentPoiAddress() + ",");
            }
            mContinuoueLocTV.setText(sb.toString());
        } else {
            Toast.makeText(baiduMapMainActivity.this, "周边没有poi", Toast.LENGTH_LONG).show();
        }
    }
}
