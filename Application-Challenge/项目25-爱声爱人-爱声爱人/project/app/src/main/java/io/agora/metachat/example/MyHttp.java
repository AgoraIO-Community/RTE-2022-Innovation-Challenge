package io.agora.metachat.example;
import android.util.Log;
import java.security.SecureRandom;
import java.security.cert.X509Certificate;

import javax.net.ssl.HostnameVerifier;
import javax.net.ssl.SSLContext;
import javax.net.ssl.SSLSession;
import javax.net.ssl.SSLSocketFactory;
import javax.net.ssl.TrustManager;
import javax.net.ssl.X509TrustManager;
import java.io.IOException;
import okhttp3.MediaType;
import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.Call;
import okhttp3.Callback;
import okhttp3.RequestBody;
import okhttp3.Response;

public class MyHttp {


    /////////////////////////////
    /**
     * description 忽略https证书验证
     */
    public static HostnameVerifier getHostnameVerifier() {
        HostnameVerifier hostnameVerifier = new HostnameVerifier() {
            @Override
            public boolean verify(String s, SSLSession sslSession) {
                return true;
            }
        };
        return hostnameVerifier;
    }

    /**
     * description 忽略https证书验证
     */
    public static SSLSocketFactory getSSLSocketFactory() {
        try {
            SSLContext sslContext = SSLContext.getInstance("SSL");
            sslContext.init(null, getTrustManager(), new SecureRandom());
            return sslContext.getSocketFactory();
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    /**
     * description 忽略https证书验证
     */
    private static TrustManager[] getTrustManager() {
        TrustManager[] trustAllCerts = new TrustManager[]{
                new X509TrustManager() {
                    @Override
                    public void checkClientTrusted(X509Certificate[] chain, String authType) {
                    }

                    @Override
                    public void checkServerTrusted(X509Certificate[] chain, String authType) {
                    }

                    @Override
                    public X509Certificate[] getAcceptedIssuers() {
                        return new X509Certificate[]{};
                    }
                }
        };
        return trustAllCerts;
    }

    public static String httpstest(String url, String head, String body) throws Exception {

        // 创建okHttpClient实例，忽略https证书验证
        String result = "";
    /*    OkHttpClient client = new OkHttpClient().newBuilder()
                .sslSocketFactory(getSSLSocketFactory())
                .hostnameVerifier(getHostnameVerifier())
                .build();
*/
      //  MediaType mediaType = MediaType.parse("text/plain");
      //  RequestBody requestBody = RequestBody.create(mediaType, body);
        /////////////////////////////////////////
      /*  Request request = new Request.Builder()
                .url(url)
                .post(requestBody)
                .addHeader("cache-control", "no-cache")
                .addHeader("reqParamter", head)
                .build();
*/
        ////////////////////////////////////////
   /*     Request request = new Request.Builder()
                .url(url)
                .build();
        Response response = client.newCall(request).execute();

        String result = response.body().string();
*/

        ////////////////////////////////////////////////

        OkHttpClient okHttpClient = new OkHttpClient();
        final Request request = new Request.Builder()
                .url(url)
                .get()//默认就是GET请求，可以不写
                .build();
        Call call = okHttpClient.newCall(request);
        call.enqueue(new Callback() {
            @Override
            public void onFailure(Call call, IOException e) {
                Log.e("okhttp ", "onFailure: ");
            }

            @Override
            public void onResponse(Call call, Response response) throws IOException {
                Log.e("okhttp ", "onResponse: " + response.body().string());
            }
        });

        ////////////////////////////////////////////////
        return result;
    }
}
