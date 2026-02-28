package com.lambo.los.kits;

import java.io.ByteArrayOutputStream;
import java.io.PrintStream;

/**
 * 操作线程的方法
 *
 * @author 林小宝 create : 2015年7月5日下午4:22:59
 */
public class ThreadKit {

    /**
     * 线程休眠 2015年7月5日
     *
     * @param millis 毫秒数据.
     */
    public static final void sleep(long millis) {
        if (millis > 1) {
            try {
                Thread.sleep(millis);
            } catch (InterruptedException e) {
            }
        }
    }

    /**
     * runable接口启动 2015年7月5日
     *
     * @param runnable 接口.
     */
    public static void thread(Runnable runnable) {
        new Thread(runnable).start();
    }

    /**
     * runable接口启动 2015年7月5日
     *
     * @param runnable   接口.
     * @param threadName 线程名称.
     */
    public static void thread(Runnable runnable, String threadName) {
        new Thread(runnable, threadName).start();
    }

    /**
     * 当前线程等待结束。 2015年7月5日
     */
    public static final void join() {
        try {
            Thread.currentThread().join();
        } catch (InterruptedException e) {
        }
    }

    public static byte[] exception(Throwable e) {
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        e.printStackTrace(new PrintStream(out));
        return out.toByteArray();
    }
}
