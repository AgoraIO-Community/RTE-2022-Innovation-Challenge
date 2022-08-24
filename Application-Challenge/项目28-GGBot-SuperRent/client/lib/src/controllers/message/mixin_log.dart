import 'package:flutter/animation.dart';
import 'package:flutter/rendering.dart';
import 'package:get/get.dart';

class Log {
  final Color color;
  final String message;

  Log(this.color, this.message);

  Log.info(this.message) : color = const Color(0xFF00E676);
  Log.error(this.message) : color = const Color(0xFFE53935);
  Log.warning(this.message) : color = const Color(0xFFFDD835);
}

mixin LogMixin on ScrollMixin {
  // 日志相关
  List<Log> get logs => _logs;
  final _logs = <Log>[].obs;

  //
  void info(String message) {
    _insertLog(Log.info('🚀$message'));
  }

  void warning(String message) {
    _insertLog(Log.warning('😈$message'));
  }

  void error(String message) {
    _insertLog(Log.error('❌$message'));
  }

  void _insertLog(Log l) {
    _logs.add(l);

    Future.delayed(const Duration(milliseconds: 300)).then(
      (value) {
        if (scroll.hasClients) {
          scroll.animateTo(
            scroll.position.maxScrollExtent,
            duration: const Duration(milliseconds: 180),
            curve: Curves.bounceIn,
          );
        }
      },
    );
  }
}
