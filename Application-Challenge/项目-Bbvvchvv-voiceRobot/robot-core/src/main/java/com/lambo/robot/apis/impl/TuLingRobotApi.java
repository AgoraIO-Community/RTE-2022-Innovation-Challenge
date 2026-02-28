package com.lambo.robot.apis.impl;

import com.lambo.los.http.client.HttpConnection;
import com.lambo.los.kits.Strings;
import com.lambo.robot.apis.IRobotApi;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.IOException;

/**
 * 图灵机器人.
 * Created by Administrator on 2017/7/20.
 */
public class TuLingRobotApi implements IRobotApi{
    private Logger logger = LoggerFactory.getLogger(getClass());
    private static final String URL_TU_LING_API = "http://www.tuling123.com/openapi/api";
    private final String appKey;
    private final String location;

    public TuLingRobotApi(String appKey) {
        this(appKey, "广东省深圳市");
    }

    public TuLingRobotApi(String appKey, String location) {
        this.appKey = appKey;
        this.location = location;
    }

    public String ask(String uid, String question) {
        HttpConnection connection = HttpConnection.connect(URL_TU_LING_API);
        connection.data("key", appKey);
        connection.data("info", question);
        if (null != location) {
            connection.data("loc", location);
        }
        connection.data("userid", uid);
        connection.method(HttpConnection.Method.POST);
        try {
            String body = connection.execute().body();
            String code = Strings.getFromJson(body, "code");
            if ("100000".equals(code)) {
                logger.debug("ask, question = {}, body = {}", question, body);
                return Strings.getFromJson(body, "text");
            }
            logger.error("tu ling api failed, question = {}, body = {}", question, body);
        } catch (IOException e) {
            logger.error("tu ling api failed, question = {}", question, e);
        }
        return null;
    }

    public static void main(String[] args) throws IOException {
        TuLingRobotApi robot = new TuLingRobotApi("e5ccc9c7c8834ec3b08940e290ff1559", "广东省深圳市");
        System.out.println(robot.ask("test", "天气"));
    }
}
