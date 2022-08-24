import 'dart:io';

import 'package:flutter/cupertino.dart';
import 'package:flutter_baidu_mapapi_base/flutter_baidu_mapapi_base.dart';
import 'package:flutter_bmflocation/flutter_bmflocation.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:g_json/g_json.dart';
import 'package:get/get.dart';
import 'package:permission_handler/permission_handler.dart';
import 'package:super_rent/src/utils/baidu_ak.dart';

import '../utils/city_code.dart';

const _kLocation = "cached_location";

class Location {
  /// 纬度
  final double latitude;

  /// 经度
  final double longitude;

  Location(this.latitude, this.longitude);
}

class LocationService extends GetxService {
  City get city => _city.value;
  final _city = Rx(City.shanghai());

  bool get locating => _locating.value;
  final _locating = false.obs;

  // 他的实时位置 默认 上海
  Location get location => _location ?? City.hotLocations[1];
  Location? _location;

  String get locationPath {
    var base =
        "https://api.map.baidu.com/staticimage/v2?ak=${BaiduAk.value}&mcode=top.rainbowbridge.app.rent.superRent";

    base += "&width=1024&height=1024&zoom=18&dpiType=ph&scale=1";
    final ls = "${location.longitude},${location.latitude}";
    base += "&center=$ls";
    base += "&markers=whereAmI|$ls";
    return base;
  }

  // 设置初始化 百度定位相关内容
  final _plugin = LocationFlutterPlugin();

  FlutterSecureStorage get _storage => const FlutterSecureStorage(
      aOptions: AndroidOptions(encryptedSharedPreferences: true));

  Future<LocationService> init() async {
    // 初始化SDK相关内容
    // 设置是否隐私政策
    // 设置是否隐私政策
    BMFMapSDK.setAgreePrivacy(true);
    // var r = await _plugin.setAgreePrivacy(true);
    // if (!r) {
    //   debugPrint("baidu map set agree privacy failed.");
    // }

    if (Platform.isIOS) {
      BMFMapSDK.setApiKeyAndCoordType(BaiduAk.value, BMF_COORD_TYPE.BD09LL);
      final r = await _plugin.authAK(BaiduAk.value);
      if (!r) {
        debugPrint("baidu map auth ak failed");
      }
    } else if (Platform.isAndroid) {
      BMFMapSDK.setCoordType(BMF_COORD_TYPE.BD09LL);
    }

    BaiduLocationAndroidOption initAndroidOptions() {
      BaiduLocationAndroidOption options = BaiduLocationAndroidOption(
// 定位模式，可选的模式有高精度、仅设备、仅网络。默
// 认为高精度模式
          locationMode: BMFLocationMode.hightAccuracy,
// 是否需要返回地址信息
          isNeedAddress: true,
// 是否需要返回海拔高度信息
          isNeedAltitude: false,
// 是否需要返回周边poi信息
          isNeedLocationPoiList: true,
// 是否需要返回新版本rgc信息
          isNeedNewVersionRgc: true,
// 是否需要返回位置描述信息
          isNeedLocationDescribe: true,
// 是否使用gps
          openGps: true,
// 可选，设置场景定位参数，包括签到场景、运动场景、出行场景
          locationPurpose: BMFLocationPurpose.signIn,
// 坐标系
          coordType: BMFLocationCoordType.bd09ll,
// 设置发起定位请求的间隔，int类型，单位ms
// 如果设置为0，则代表单次定位，即仅定位一次，默认为0
          scanspan: 0);
      return options;
    }

    final androidOptions = initAndroidOptions();

    BaiduLocationIOSOption initIOSOptions() {
      BaiduLocationIOSOption options = BaiduLocationIOSOption(
        // 坐标系
        coordType: BMFLocationCoordType.bd09ll,
        // 位置获取超时时间
        locationTimeout: 10,
        // 获取地址信息超时时间
        reGeocodeTimeout: 10,
        // 应用位置类型 默认为automotiveNavigation
        activityType: BMFActivityType.automotiveNavigation,
        // 设置预期精度参数 默认为best
        desiredAccuracy: BMFDesiredAccuracy.best,
        // 是否需要最新版本rgc数据
        isNeedNewVersionRgc: true,
        // 指定定位是否会被系统自动暂停
        pausesLocationUpdatesAutomatically: false,
        // 指定是否允许后台定位,
        // 允许的话是可以进行后台定位的，但需要项目
// 配置允许后台定位，否则会报错，具体参考开发文档
        allowsBackgroundLocationUpdates: true,
        // 设定定位的最小更新距离
        distanceFilter: 10,
      );
      return options;
    }

    final iosOptions = initIOSOptions();
    final r =
        await _plugin.prepareLoc(androidOptions.getMap(), iosOptions.getMap());
    if (!r) {
      debugPrint("baidu map prepare loc failed");
    }

    // 1. 看下缓存中有没有位置
    var locationString = await _storage.read(
        key: _kLocation,
        aOptions: const AndroidOptions(encryptedSharedPreferences: true));

    if (locationString != null) {
      final j = JSON.parse(locationString);

      _city(City(j["cityCode"].stringValue, j["name"].stringValue));
      _location =
          Location(j["latitude"].ddoubleValue, j["longitude"].ddoubleValue);
    }

    return this;
  }

  void _updateCity(BaiduLocation l) {
    final city = City(l.cityCode!, l.city!.replaceAll("市", ""));
    final location = Location(l.latitude!, l.longitude!);
    updateCity(city, location);
  }

  void updateCity(City newCity, Location newLocation) {
    if (city.code != newCity.code) {
      _city(newCity);
    }
    _location = newLocation;

    _storage.write(
      key: _kLocation,
      value: JSON({
        "cityCode": newCity.code,
        "name": newCity.name,
        "latitude": newLocation.latitude,
        "longitude": newLocation.longitude,
      }).rawString(),
    );
  }

  void _saveLocation(BaiduLocation location) {
    _locating(false);
    if (location.cityCode != null &&
        location.cityCode != "" &&
        location.city != null &&
        location.city != "") {
      if (location.cityCode != city.code) {
        // 询问用户是否自动切换城市
        Get.dialog(
          CupertinoAlertDialog(
            title: Text("自动为您切换到${location.city!}?"),
            actions: [
              CupertinoActionSheetAction(
                onPressed: () {
                  Get.back();
                },
                child: const Text("不用"),
              ),
              CupertinoActionSheetAction(
                onPressed: () {
                  _updateCity(location);
                  Get.back();
                },
                isDefaultAction: true,
                child: const Text("好的👌"),
              )
            ],
          ),
        );
      }
    }
  }

  // 定位
  void whereAmI() {
    _locating(true);
    if (Platform.isIOS) {
      _plugin.singleLocationCallback(callback: _saveLocation);
    } else if (Platform.isAndroid) {
      _plugin.seriesLocationCallback(callback: (location) {
        _plugin.stopLocation();
        _saveLocation(location);
      });
    }

    _plugin.singleLocation({'isReGeocode': true, 'isNetworkState': true});

    // 15s 如果还没有返回，默认定位失败
    Future.delayed(const Duration(seconds: 15)).then((value) {
      debugPrint("超时结束");
      _locating(false);
    });
  }

  Future<PermissionStatus> requestLocationPermission() async {
    final status = await Permission.location.status;
    if (status.isGranted) {
      return status;
    }
    // 申请定位权限
    return Permission.location.request();
  }
}
