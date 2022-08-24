import 'dart:async';

import 'package:async/async.dart';
import 'package:g_json/g_json.dart';
import 'package:leancloud_storage/leancloud.dart';
import 'package:super_rent/src/models/place.dart';
import 'package:super_rent/src/services/location.dart';
import 'package:super_rent/src/utils/error.dart';

void initLeancloud() {
  LeanCloud.initialize(
    "QXM8aR1StigS3UrR4gMwvIF9-gzGzoHsz",
    "bJdrXeJUuO1cAx2yU80xYXY7",
    server: "https://rent-api.rainbowbridge.top",
    queryCache: LCQueryCache(),
  );

  LCLogger.setLevel(LCLogger.DebugLevel);
}

extension ResultCapsule on Result {
  String get errorMessage => asError?.error.toString() ?? "Succeed";
}

class API {
  // 通知其他人已经开播啦
  static Future<void> notifyOtherUsers(
      {required String channelId,
      required LCUser user,
      required String address}) async {
    LCCloud.run("live_notification", params: {
      'channel_id': channelId,
      'nick_name': user['nickname'],
      'username': user['emUid'],
      'address': address,
    });
  }

  // 地点输入提示
  static FutureOr<Result<JSON>> searchPlace(
      String query, String cityCode, Location location) async {
    try {
      final result = await LCCloud.run("baidu_place_search", params: {
        "query": query,
        "cityCode": cityCode,
        "latitude": location.latitude.toString(),
        "longitude": location.longitude.toString(),
      });
      return Result.value(JSON(result["result"]));
    } catch (err) {
      return Result.error(RentError.lc(err));
    }
  }

  // 插入小区
  static Future<LCObject> createCompoundIfNeed(Place p) async {
    final uid = p['uid'].stringValue;
    var compound = await LCQuery("Compound").whereEqualTo("uid", uid).first();
    // 插入小区
    if (compound == null) {
      compound = LCObject("Compound");
      for (final key in p.mapValue.keys) {
        if (key == "location") {
          final l = p[key];
          compound[key] =
              LCGeoPoint(l['lat'].ddoubleValue, l['lng'].ddoubleValue);
        } else {
          compound[key] = p[key].value;
        }
      }
    }

    return compound;
  }

  // admin,publisher,subscriber,attendee
  static Future<Result<String>> createRtcToken(
      {required String channel, required String role}) async {
    try {
      final result = await LCCloud.run("fetch_rtc_token", params: {
        "channel": channel,
        "role": role,
      });
      return Result.value(result["result"]);
    } catch (err) {
      return Result.error(RentError.lc(err));
    }
  }

  // 请求开始录制
  static Future<Result<String>> startRecord({
    required String channel,
    required String houseObjectId,
    required String chantRoomId,
  }) async {
    try {
      final result = await LCCloud.run('request_record', params: {
        "channel": channel,
        "houseObjectId": houseObjectId,
        "chatRoomId": chantRoomId,
      });
      return Result.value(result['result']);
    } catch (err) {
      return Result.error(RentError.lc(err));
    }
  }

  // 结束录制
  static Future<Result<bool>> stopRecord(String ref) async {
    try {
      final result = await LCCloud.run('stop_record', params: {
        "taskObjectId": ref,
      });
      return Result.value(result['result']);
    } catch (err) {
      return Result.error(RentError.lc(err));
    }
  }

  // 查看某个channel详情
  static Future<Result<JSON>> fetchChannel(String channelId) async {
    try {
      final result = await LCCloud.run('get_channel', params: {
        "channel": channelId,
      });
      return Result.value(result['result']);
    } catch (err) {
      return Result.error(RentError.lc(err));
    }
  }

  // 获取现在所有活跃的channel
  static Future<Result<List<JSON>>> fetchChannels() async {
    try {
      final result = await LCCloud.run('get_channels');
      return Result.value(JSON(result['result']).listValue);
    } catch (err) {
      return Result.error(RentError.lc(err));
    }
  }

  // 通过会话id 查询对应的用户信息
  static Future<Result<LCUser>> findUser(String conversationId) async {
    try {
      final result = await LCCloud.rpc('find_user_by_conversation_id', params: {
        "conversationId": conversationId,
      });
      if (result == null) {
        return Result.error("user not found");
      }
      LCUser user = result['result'];
      await user.fetch();
      return Result.value(result['result']);
    } catch (err) {
      return Result.error(RentError.lc(err));
    }
  }
}
