package com.lambo.robot;

/**
 * 操作系统.
 * Created by lambo on 2017/7/24.
 */
public interface IRobotOperatingSystem extends Runnable {

    /**
     * 安装应用.
     *
     * @param app
     */
    void install(IApp app);

    /**
     * 关闭系统.
     */
    void halt();
}
