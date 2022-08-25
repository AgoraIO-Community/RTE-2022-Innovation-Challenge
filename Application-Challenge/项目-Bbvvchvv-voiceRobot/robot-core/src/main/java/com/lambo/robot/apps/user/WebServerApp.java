package com.lambo.robot.apps.user;

import com.lambo.los.http.server.JavaHttpServer;
import com.lambo.los.kits.Strings;
import com.lambo.los.kits.io.IOKit;
import com.lambo.robot.RobotAppContext;
import com.lambo.robot.RobotSystemContext;
import com.lambo.robot.apps.MsgTypeBaseApp;
import com.lambo.robot.model.RobotMsg;
import com.lambo.robot.model.enums.MsgTypeEnum;
import com.lambo.robot.model.enums.SystemMsgContentEnum;
import com.lambo.robot.model.msgs.HearMsg;
import com.lambo.robot.model.msgs.SystemMsg;
import com.lambo.robot.model.msgs.WakeUpMsg;

import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.Charset;

/**
 * web应用服务器.
 * Created by Administrator on 2017/7/25.
 */
public class WebServerApp extends MsgTypeBaseApp implements JavaHttpServer.JavaHttpHandle {
    private final JavaHttpServer javaHttpServer;
    private RobotSystemContext systemContext;

    public WebServerApp(int port) {
        super(MsgTypeEnum.listening);
        javaHttpServer = JavaHttpServer.createHttpServer(port, 1000);
        javaHttpServer.createContext("/", this);
    }

    @Override
    public void handleSystemMsg(RobotSystemContext systemContext, SystemMsg msg) {
        super.handleSystemMsg(systemContext, msg);
        if (msg.getContent() == SystemMsgContentEnum.startUp) {
            this.javaHttpServer.start();
            this.systemContext = systemContext;
        }
    }

    @Override
    public boolean handle(RobotAppContext appContext, RobotMsg<?> msg) throws Exception {
        return false;
    }
    Charset utf8 = Charset.forName("UTF-8");
    private byte[] indexData;
    @Override
    public void handle(JavaHttpServer.JavaHttpRequest request, JavaHttpServer.JavaHttpResponse response) throws IOException {
        response.addHeader("Content-Type","text/html;charset=UTF-8");
        if (request.getPath().contains("/index.html")){
            if (null == indexData) {
                InputStream inputStream = IOKit.getInputStream("classpath:/index.html");
                indexData = IOKit.readToByteBuffer(inputStream);
                IOKit.closeIo(inputStream);
            }
            response.setResponse(indexData);
            return;
        }
        if (null != systemContext && "/hear".equals(request.getPath()) && !Strings.isBlank(request.getRequestURI().getQuery())) {
            HearMsg robotMsg = new HearMsg(request.getRequestURI().getQuery());
            systemContext.addMsg(null, robotMsg);
            systemContext.setWakeUpUid("web");
            response.setResponse(robotMsg.toString().getBytes(utf8));
        } else if (null != systemContext && "/wakeUp".equals(request.getPath())) {
            WakeUpMsg robotMsg = new WakeUpMsg("web");
            systemContext.addMsg(null, robotMsg);
            response.setResponse(robotMsg.toString().getBytes(utf8));
        }
    }
}
