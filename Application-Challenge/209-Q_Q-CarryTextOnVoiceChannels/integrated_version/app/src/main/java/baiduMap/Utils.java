package baiduMap;

import android.text.TextUtils;

import com.baidu.location.BDLocation;
import com.baidu.location.LocationClient;
import com.baidu.location.Poi;

import java.text.SimpleDateFormat;
import java.util.Locale;


public class Utils {

    public static String getLocationStr(BDLocation location, LocationClient locationClient) {
        if (null == location) {
            return null;
        }
        StringBuffer sb = new StringBuffer(256);
        sb.append("\n定位时间 : ");
        sb.append(location.getTime());
        sb.append("\n回调时间: " + formatDateTime(System.currentTimeMillis(), "yyyy-MM-dd HH:mm:ss"));
        sb.append("\n定位类型 : ");// 定位类型
        sb.append(location.getLocType());
        sb.append("\n经度 : ");// 纬度
        sb.append(location.getLongitude());
        sb.append("\n纬度 : ");// 经度
        sb.append(location.getLatitude());
        sb.append("\n精度 : ");// 半径
        sb.append(location.getRadius());
        if (location.getLocType() == BDLocation.TypeNetWorkLocation) {// 网络定位结果
            // 运营商信息
            if (location.hasAltitude()) {// *****如果有海拔高度*****
                sb.append("海拔高度 : ");
                sb.append(location.getAltitude());// 单位：米
            }
        }
        sb.append("\n方向: ");
        sb.append(location.getDirection());// 方向
        sb.append("\n国家编码 : ");// 国家码
        sb.append(location.getCountryCode());
        sb.append("\n国家 : ");// 城市
        sb.append(location.getCountry());
        sb.append("\n省份 : ");// 获取省份
        sb.append(location.getProvince());
        sb.append("\n城市编码 : ");// 城市编码
        sb.append(location.getCityCode());
        sb.append("\n城市 : ");// 国家名称
        sb.append(location.getCity());
        sb.append("\n区县 : ");// 区
        sb.append(location.getDistrict());
        sb.append("\n乡镇街道 : ");// 获取镇信息
        sb.append(location.getTown());
        sb.append("\n地址 : ");// 地址信息
        sb.append(location.getAddrStr());
        sb.append("\n附近街道 : ");// 街道
        sb.append(location.getStreet());
        sb.append("\n室内外结果 : ");// *****返回用户室内外判断结果*****
        sb.append(location.getUserIndoorState());
        sb.append("\n位置语义化 : ");
        sb.append(location.getLocationDescribe());// 位置语义化信息
        sb.append("\nPOI兴趣点 : ");// POI信息
        if (location.getPoiList() != null && !location.getPoiList().isEmpty()) {
            for (int i = 0; i < location.getPoiList().size(); i++) {
                Poi poi = (Poi) location.getPoiList().get(i);
                sb.append("\n"+" POI名称 : ");
                sb.append(poi.getName() + ", ");
                sb.append("POI类型 : ");
                sb.append(poi.getTags());
            }
        }
        if (location.getLocType() == BDLocation.TypeGpsLocation) {// GPS定位结果
            sb.append("\n速度 : ");
            sb.append(location.getSpeed());// 速度 单位：km/h
            sb.append("\n卫星数 : ");
            sb.append(location.getSatelliteNumber());// 卫星数目
            sb.append("\n海拔高度 : ");
            sb.append(location.getAltitude());// 海拔高度 单位：米
        }
        sb.append("\nSDK版本 : ");
        if (null != locationClient) {
            String version = locationClient.getVersion();// 获取sdk版本
            sb.append(version);
        }

        return  sb.toString();
    }


    public static String getLocDiagnosticStr(int locType, int diagnosticType, String diagnosticMessage) {
        StringBuffer sb = new StringBuffer(256);
        sb.append("诊断结果: ");
        if (locType == BDLocation.TypeNetWorkLocation) {
            if (diagnosticType == 1) {
                sb.append("网络定位成功，没有开启GPS，建议打开GPS会更好");
                sb.append("\n" + diagnosticMessage);
            } else if (diagnosticType == 2) {
                sb.append("网络定位成功，没有开启Wi-Fi，建议打开Wi-Fi会更好");
                sb.append("\n" + diagnosticMessage);
            }
        } else if (locType == BDLocation.TypeOffLineLocationFail) {
            if (diagnosticType == 3) {
                sb.append("定位失败，请您检查您的网络状态");
                sb.append("\n" + diagnosticMessage);
            }
        } else if (locType == BDLocation.TypeCriteriaException) {
            if (diagnosticType == 4) {
                sb.append("定位失败，无法获取任何有效定位依据");
                sb.append("\n" + diagnosticMessage);
            } else if (diagnosticType == 5) {
                sb.append("定位失败，无法获取有效定位依据，请检查运营商网络或者Wi-Fi网络是否正常开启，尝试重新请求定位");
                sb.append(diagnosticMessage);
            } else if (diagnosticType == 6) {
                sb.append("定位失败，无法获取有效定位依据，请尝试插入一张sim卡或打开Wi-Fi重试");
                sb.append("\n" + diagnosticMessage);
            } else if (diagnosticType == 7) {
                sb.append("定位失败，飞行模式下无法获取有效定位依据，请关闭飞行模式重试");
                sb.append("\n" + diagnosticMessage);
            } else if (diagnosticType == 9) {
                sb.append("定位失败，无法获取任何有效定位依据");
                sb.append("\n" + diagnosticMessage);
            }
        } else if (locType == BDLocation.TypeServerError) {
            if (diagnosticType == 8) {
                sb.append("定位失败，请确认您定位的开关打开状态，是否赋予APP定位权限");
                sb.append("\n" + diagnosticMessage);
            }
        }
        return sb.toString();
    }

    private static SimpleDateFormat simpleDateFormat = null;
    public  static String formatDateTime(long time, String strPattern) {
        if (TextUtils.isEmpty(strPattern)) {
            strPattern = "yyyy-MM-dd HH:mm:ss";
        }
        if (simpleDateFormat == null) {
            try {
                simpleDateFormat = new SimpleDateFormat(strPattern, Locale.CHINA);
            } catch (Throwable e) {
            }
        } else {
            simpleDateFormat.applyPattern(strPattern);
        }
        return simpleDateFormat == null ? "NULL" : simpleDateFormat.format(time);
    }
}
