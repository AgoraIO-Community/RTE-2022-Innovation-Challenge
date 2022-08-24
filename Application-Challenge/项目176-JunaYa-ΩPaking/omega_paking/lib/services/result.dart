
import 'package:omega_paking/_internal/http_client.dart';

class ServiceResult<T> {
  final HttpResponse response;
  final T? content;

  bool get success => response.success;

  ServiceResult(this.content, this.response);
}
