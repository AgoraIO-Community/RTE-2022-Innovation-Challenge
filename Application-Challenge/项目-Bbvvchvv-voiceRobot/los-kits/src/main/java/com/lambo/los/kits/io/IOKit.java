package com.lambo.los.kits.io;

import com.lambo.los.kits.Strings;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.*;
import java.net.ServerSocket;
import java.net.Socket;
import java.net.URL;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.atomic.AtomicInteger;

public class IOKit {
    private final static Logger logger = LoggerFactory.getLogger(IOKit.class);

    /**
     * 代理一个输入流 ,以用于进行解密或解密操作.
     *
     * @param in
     * @param keys
     * @param isEncoder
     * @return
     * @createTime 2014年12月16日 下午11:33:52
     */
    public static final InputStream proxy(final InputStream in, final byte[] keys, final int isEncoder) {
        final int keys_len = keys.length;
        return new InputStream() {
            final AtomicInteger index_seq = new AtomicInteger();

            public int read(byte[] bytes) throws IOException {
                int result = in.read(bytes);
                if (result > -1 && isEncoder > 0) {
                    for (int i = 0; i < result; i++) {
                        int index = index_seq.getAndIncrement();
                        if (1 == isEncoder) {
                            bytes[i] = (byte) (bytes[i] + keys[index % keys_len]);
                        } else {
                            bytes[i] = (byte) (bytes[i] - keys[index % keys_len]);
                        }
                    }
                }
                return result;
            }

            public int read() throws IOException {
                int result = in.read();
                if (result > -1 && isEncoder > 0) {
                    byte b = (byte) result;
                    int index = index_seq.getAndIncrement();
                    if (1 == isEncoder) {
                        b = (byte) (b + keys[index % keys_len]);
                    } else {
                        b = (byte) (b - keys[index % keys_len]);
                    }
                    result = b;
                }
                return result;
            }

            public void close() throws IOException {
                in.close();
            }
        };
    }

    /**
     * 代理一个输出流 ,以用于进行解密或解密操作.
     *
     * @param out
     * @param keys
     * @param isEncoder
     * @return
     * @createTime 2014年12月16日 下午11:34:33
     */
    public static final OutputStream proxy(final OutputStream out, final byte[] keys, final int isEncoder) {
        final int keys_len = keys.length;
        return new OutputStream() {
            final AtomicInteger index_seq = new AtomicInteger();

            public void write(int b) throws IOException {
                byte result = (byte) b;
                if (isEncoder > 0 && b > -1) {
                    int index = index_seq.getAndIncrement();
                    if (1 == isEncoder) {
                        result = (byte) (result + keys[index % keys_len]);
                    } else {
                        result = (byte) (result - keys[index % keys_len]);
                    }
                }
                out.write(result);
            }

            public void write(byte[] bytes, int off, int len) throws IOException {
                if (isEncoder > 0 && len > 0) {
                    for (int i = off; i < len; i++) {
                        int index = index_seq.getAndIncrement();
                        if (1 == isEncoder) {
                            bytes[i] = (byte) (bytes[i] + keys[index % keys_len]);
                        } else {
                            bytes[i] = (byte) (bytes[i] - keys[index % keys_len]);
                        }
                    }
                }
                out.write(bytes, off, len);
            }

            public void write(byte[] b) throws IOException {
                write(b, 0, b.length);
            }

            public void flush() throws IOException {
                out.flush();
            }

            public void close() throws IOException {
                out.close();
            }
        };
    }

    public static final void closeIo(ServerSocket closeable) {
        if (null != closeable) {
            try {
                closeable.close();
            } catch (IOException e) {
            }
        }
    }

    /**
     * IO操作中共同的关闭方法
     *
     * @param closeable
     * @createTime 2014年12月14日 下午7:50:56
     */
    public static final void closeIo(Socket closeable) {
        if (null != closeable) {
            try {
                closeable.close();
            } catch (IOException e) {
            }
        }
    }

    /**
     * IO操作中共同的关闭方法
     *
     * @param closeable
     * @createTime 2014年12月14日 下午7:50:56
     */
    public static void closeIo(AutoCloseable closeable) {
        if (null != closeable) {
            try {
                closeable.close();
            } catch (Exception ignored) {
            }
        }
    }

    /**
     * 数据交换.主要用于tcp协议的交换
     *
     * @param latch 锁
     * @param in    输入流
     * @param out   输出流
     * @createTime 2014年12月13日 下午11:06:47
     */
    public static final void transfer(final CountDownLatch latch, final InputStream in, final OutputStream out) {
        new Thread() {
            public void run() {
                byte[] bytes = new byte[1024];
                int n;
                try {
                    while ((n = in.read(bytes)) > -1) {
                        out.write(bytes, 0, n);
                        out.flush();
                    }
                } catch (Exception e) {
                }
                if (null != latch) {
                    latch.countDown();
                }
            }

            ;
        }.start();
    }

    public static byte[] readToByteBufferByLength(InputStream inStream, int length) throws IOException {
        ByteArrayOutputStream outStream = new ByteArrayOutputStream();
        if (length > 0) {
            int bufferSize = 0x2000;
            byte[] buffer = new byte[bufferSize];
            int read;
            int remaining = length;

            while (remaining > 0) {
                if (remaining < bufferSize) {
                    buffer = new byte[remaining];
                }
                read = inStream.read(buffer);
                if (-1 == read) {
                    break;
                }
                remaining -= read;
                outStream.write(buffer, 0, read);
            }
        }
        return outStream.size() > 0 ? outStream.toByteArray() : null;
    }

    public static byte[] readToByteBuffer(InputStream inStream, int maxSize) throws IOException {
        ByteArrayOutputStream outStream = new ByteArrayOutputStream();
        if (maxSize > 0) {
            int bufferSize = 0x2000;
            byte[] buffer = new byte[bufferSize];
            int read;
            int remaining = maxSize;

            while (true) {
                read = inStream.read(buffer);
                if (-1 == read) {
                    break;
                }
                if (read > remaining) {
                    outStream.write(buffer, 0, read);
                    break;
                }
                remaining -= read;
                outStream.write(buffer, 0, read);
                if (bufferSize > read && inStream.available() == 0) {
                    break;
                }
            }
        }
        return outStream.size() > 0 ? outStream.toByteArray() : null;
    }

    public static byte[] readToByteBuffer(InputStream inStream) throws IOException {
        return readToByteBuffer(inStream, 1024 * 1024);
    }

    public static final File getFileEveryWhere(String path) {
        File f = new File(path);
        if (f.exists()) {
            return f;
        }
        if (path.startsWith("classpath:")) {
            path = path.substring("classpath:".length());
            f = new File(path.startsWith("/") ? path.substring(1) : path);
            if (f.exists()) {
                return f;
            }
        }
        f = new File(System.getProperty("user.dir") + "/" + path);
        if (f.exists()) {
            return f;
        }
        URL rs = IOKit.class.getResource(path);
        if (null != rs) {
            f = new File(rs.getFile());
            if (f.exists()) {
                return f;
            }
        }
        return null;
    }

    public static InputStream getInputStream(String configPath) throws FileNotFoundException {
        InputStream result;
        if (null == configPath) {
            return null;
        }
        if (configPath.startsWith("classpath:")) {
            configPath = configPath.substring("classpath:".length());
            File config = new File(configPath.startsWith("/") ? configPath.substring(1) : configPath);
            if (config.exists() && config.isFile()) {
                result = new FileInputStream(config);
            } else {
                result = IOKit.class.getResourceAsStream(configPath);
            }
        } else {
            result = new FileInputStream(configPath);
        }
        return result;
    }

    public static void writeFile(String filePath, byte[] data) {
        if (Strings.isBlank(filePath) || null == data) {
            return;
        }
        File file = new File(filePath);
        if (!file.getParentFile().exists()) {
            file.getParentFile().mkdirs();
        }
        try (OutputStream out = new FileOutputStream(file)) {
            out.write(data);
            out.flush();
        } catch (Exception e) {
            logger.error("writeFile failed, path = {}, msg = {}", filePath, e.getLocalizedMessage(), e);
        }
    }

    public static int next(final byte[] data, int pos, final byte[] splitter) {
        if (pos > -1 && null != splitter && splitter.length > 0 && null != data &&
                data.length > (pos + splitter.length - 1)) {
            int splitterLen = splitter.length;
            int i;
            for (pos += splitterLen; pos < data.length; pos++) {
                for (i = 0; i < splitterLen; i++) {
                    if (splitter[i] != data[pos - splitterLen + i]) {
                        break;
                    }
                }
                if (i == splitterLen) {
                    return pos - splitterLen;
                }
            }
        }
        return -1;
    }

    public static byte[] next(final InputStream in, final byte[] splitter) throws IOException {
        if (null == in || null == splitter || splitter.length == 0) {
            return null;
        }
        int c;
        ByteArrayOutputStream result = null;
        int splitterLen = splitter.length;
        int i;
        int pos = 0;
        int currIndex = 0;
        byte[] cache = new byte[splitterLen];
        while ((c = in.read()) > -1) {
            currIndex = pos % splitterLen;
            if (null == result) {
                result = new ByteArrayOutputStream();
            }
            if (pos >= splitterLen) {
                result.write(cache[currIndex]);
            }
            cache[currIndex] = (byte) c;
            for (i = 0; pos >= splitterLen - 1 && i < splitterLen; i++) {
                if (splitter[i] != cache[(currIndex + 1 + i) % splitterLen]) {
                    break;
                }
            }
            if (i == splitterLen) {
                return result.toByteArray();
            }
            pos++;
        }
        if (null != result) {
            int len = pos - result.size();
            for (i = len - 1; i >= 0; i--) {
                result.write(cache[(currIndex - i + splitterLen) % splitterLen]);
            }
        }
        return null != result ? result.toByteArray() : null;
    }
}
