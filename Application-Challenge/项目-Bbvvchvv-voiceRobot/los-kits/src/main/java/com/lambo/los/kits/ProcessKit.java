package com.lambo.los.kits;

import com.lambo.los.kits.io.IOKit;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.nio.charset.Charset;
import java.util.concurrent.TimeoutException;

/**
 * 一个进程调用工具.
 * Created by chenyh on 2016/8/5.
 */
public class ProcessKit {
    /**
     * 运行一个外部命令，返回状态.若超过指定的超时时间，抛出TimeoutException
     */
    public static ProcessStatus execute(final long timeout, final String... command)
            throws IOException, InterruptedException, TimeoutException {

        ProcessBuilder pb = new ProcessBuilder(command);
        pb.redirectErrorStream(true);
        Process process = pb.start();
        Worker worker = new Worker(process);
        worker.start();
        ProcessStatus ps = worker.getProcessStatus();
        try {
            worker.join(timeout);
            if (ps.exitCode == ProcessStatus.CODE_STARTED) {
                // not finished
                worker.interrupt();
                throw new TimeoutException();
            } else {
                return ps;
            }
        } catch (InterruptedException e) {
            // canceled by other thread.
            worker.interrupt();
            throw e;
        } finally {
            process.destroy();
        }
    }


    private static class Worker extends Thread {
        private final Process process;
        private ProcessStatus ps;

        private Worker(Process process) {
            this.process = process;
            this.ps = new ProcessStatus();
        }

        public void run() {
            try {
                InputStream is = process.getInputStream();
                try {
                    StringBuilder buffer = new StringBuilder();
                    String name = System.getProperty("sun.jnu.encoding");
                    if (Strings.isBlank(name)) {
                        name = Charset.defaultCharset().displayName();
                    }
                    BufferedReader read = new BufferedReader(new InputStreamReader(is, name));
                    String line;
                    while ((line = read.readLine()) != null) {
                        buffer.append(line).append("\n");
                    }
                    ps.exitCode = process.waitFor();
                    ps.output = buffer.toString();
                } catch (IOException ignore) {
                    ignore.printStackTrace();
                } finally {
                    IOKit.closeIo(is);
                }
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }
        }

        public ProcessStatus getProcessStatus() {
            return this.ps;
        }
    }

    public static class ProcessStatus {
        public static final int CODE_STARTED = -257;
        public volatile int exitCode;
        public volatile String output;

        @Override
        public String toString() {
            return "ProcessStatus{" +
                    "exitCode=" + exitCode +
                    ", output='" + output + '\'' +
                    '}';
        }
    }
}