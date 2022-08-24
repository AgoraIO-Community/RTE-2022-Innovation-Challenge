String timeDescriptionFromNow(DateTime date) {
  final d = DateTime.now().difference(date);
  if (d.inMinutes == 0) {
    return "几秒前";
  }

  if (d.inMinutes < 59) {
    return "${d.inMinutes}分钟前";
  }

  if (d.inHours < 24) {
    return "${d.inHours}小时前";
  }

  if (d.inDays < 30) {
    return "${d.inDays}天前";
  }

  return "${d.inDays / 30}个月前";
}
