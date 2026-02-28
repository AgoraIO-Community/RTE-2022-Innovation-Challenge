package com.lambo.robot.apis;

import com.lambo.robot.apis.impl.TuLingRobotApi;
import org.junit.Test;

/**
 * test.
 * Created by lambo on 2017/7/21.
 */
public class TuLingRobotApiTest {
    TuLingRobotApi robot = new TuLingRobotApi("这里需要appKey");//这里需要appKey

    @Test
    public void testAsk() {
        System.out.println(robot.ask("test", "时间"));
    }
}