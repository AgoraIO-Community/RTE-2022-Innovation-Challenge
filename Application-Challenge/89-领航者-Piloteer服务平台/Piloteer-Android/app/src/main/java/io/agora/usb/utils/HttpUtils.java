package io.agora.usb.utils;

import android.util.Log;

import org.json.JSONObject;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;

public class HttpUtils {
    //我的本地服务器的接口，如果在你自己的服务器上需要更改相应的url
    private static String httpurl ="http://ilittleprince.com/Pilot/register.php";
   public static void AskPHP(String deviceName, String devicePhone,String channelName, double lnt, double lat) throws IOException {

        new Thread(new Runnable() {
            @Override
            public void run() {
                try {
                    URL url = new URL(httpurl);
                    HttpURLConnection connection = (HttpURLConnection) url.openConnection();
                    connection.setRequestMethod("POST");
                    connection.setReadTimeout(15000);
                    connection.setConnectTimeout(15000);
                    connection.setDoInput(true);
                    connection.setDoOutput(true);
                    //Post方式不能缓存,需手动设置为false
                    connection.setUseCaches(false);
                    //设置请求的头
                    String data = "{" + "\"eye_num\":\"" + deviceName + "\","+ "\"eye_phone\":\"" + devicePhone + "\"," + "\"chart_room\":\"" + channelName +  "\","+"\"lnt\":" + lnt + ","+ "\"lat\":" + lat +  "}";//传递的数据
                   // Log.e("AA",data);
                    OutputStream out = connection.getOutputStream();
                    out.write(data.getBytes());
                    out.flush();
                    /***********************************/
                    int responseCode = connection.getResponseCode();
                    if (responseCode == HttpURLConnection.HTTP_OK) { // 请求成功
                        InputStream inputStream = connection.getInputStream(); // 得到响应流
                        JSONObject json = streamToJson(inputStream); // 从响应流中提取 JSON
                        Log.e("jsonback", json.toString()); // 打印返回的 JSON 观察处理
                        String name =json.getString("result");

                    }
                    connection.disconnect();
                } catch (Exception e) {
                    e.printStackTrace();
                }
            }
        }).start();
    }
    private static JSONObject streamToJson(InputStream inputStream) throws Exception {
        BufferedReader bufferedReader = new BufferedReader(new InputStreamReader(inputStream,"UTF-8"));
        String temp = "";
        StringBuilder stringBuilder = new StringBuilder();
        while ((temp = bufferedReader.readLine()) != null) {
            stringBuilder.append(temp);
        }
        JSONObject json = new JSONObject(stringBuilder.toString().trim());
        return json;
    }
}
