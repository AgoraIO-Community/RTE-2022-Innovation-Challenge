package com.lambo.los.http.server;

import com.lambo.los.http.utils.HeadersFilter;
import com.lambo.los.kits.BizException;
import com.lambo.los.kits.Strings;
import com.sun.net.httpserver.HttpContext;
import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;
import com.sun.net.httpserver.HttpServer;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.InetSocketAddress;
import java.net.URI;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.Executor;
import java.util.concurrent.Executors;

/**
 * 简易版的http服务器
 *
 * @author 林小宝 create : 2015年7月26日下午10:27:59
 */
@SuppressWarnings("all")
public class JavaHttpServer {
    private final Logger logger = LoggerFactory.getLogger(getClass());
    private static final String KEY_JSESSIONID = "JSESSIONID";

    private final HttpServer httpServer;
    private final HeadersFilter headersFilter = new HeadersFilter();

    private JavaHttpServer(HttpServer httpServer) {
        this.httpServer = httpServer;
    }

    /**
     * 创建一个http服务器 2015年7月26日
     *
     * @param port     端口.
     * @param nThreads 处理的缓存个数.
     * @return http服务器.
     */
    public static JavaHttpServer createHttpServer(int port, int nThreads) {
        try {
            return new JavaHttpServer(HttpServer.create(new InetSocketAddress(port), nThreads));
        } catch (IOException e) {
            throw new BizException(e);
        }
    }

    /**
     * 设置执行线程池，默认为无线程池.
     *
     * @param executor
     */
    public JavaHttpServer setExecutor(Executor executor) {
        httpServer.setExecutor(executor);
        return this;
    }

    /**
     * 添加配置 2015年7月26日
     *
     * @param path   处理器的配置.
     * @param handle 处理器.
     */
    public void createContext(String path, JavaHttpHandle handle) {
        if (null != path) {
            path = path.trim();
            if (handle != null) {
                logger.info("add handle success , path= {}, handle = {}", path, handle);
                HttpContext context = httpServer.createContext(path, new HttpHandlerAdapter(handle));
                context.getFilters().add(headersFilter);
                return;
            }
        }
        logger.error("createContext failed, path[{}], handle[{}]", path, handle);
    }

    public void start() {
        if (null == httpServer.getExecutor()) {
            httpServer.setExecutor(Executors.newCachedThreadPool());
        }
        httpServer.start();
    }

    public interface JavaHttpHandle {
        /**
         * 处理.
         *
         * @param request  请求.
         * @param response 响应.
         * @throws IOException
         */
        void handle(JavaHttpRequest request, JavaHttpResponse response) throws IOException;
    }

    public class JavaHttpResponse {
        private final HttpExchange httpExchange;
        private boolean notProccess = true;

        JavaHttpResponse(HttpExchange httpExchange) {
            this.httpExchange = httpExchange;
        }

        public void setResponse(byte[] responseBody) throws IOException {
            setResponse(200, responseBody);
        }

        public void setResponse(int statusCode, byte[] responseBody) throws IOException {
            setResponse(statusCode, "OK", responseBody);
        }

        public void setResponse(int statusCode, String statusMessage, byte[] responseBody) throws IOException {
            notProccess = false;
            if (null == responseBody) {
                responseBody = new byte[0];
            }
            httpExchange.sendResponseHeaders(statusCode, responseBody.length);
            OutputStream outputStream = httpExchange.getResponseBody();
            outputStream.write(responseBody);
            outputStream.flush();
            outputStream.close();
        }

        public void addHeader(String headerKey, String headerValue) {
            httpExchange.getResponseHeaders().add(headerKey, headerValue);
        }

        public String getRespHeader(String headerKey) {
            return httpExchange.getResponseHeaders().getFirst(headerKey);
        }

        public OutputStream getResponseBody() {
            return httpExchange.getResponseBody();
        }
    }

    /**
     * 请求对象.
     */
    public class JavaHttpRequest {
        private final HttpExchange httpExchange;
        private final String sessionId;

        JavaHttpRequest(HttpExchange httpExchange) {
            this.httpExchange = httpExchange;
            List<String> cookies = httpExchange.getRequestHeaders().get("Cookie");
            String sessionId = null;
            if (null != cookies) { // 设置 sessionId 的cookie.
                for (String cookie : cookies) {
                    if (cookie.contains(KEY_JSESSIONID)) {
                        sessionId = Strings.getParam(cookie, KEY_JSESSIONID);
                    }
                }
            }
            if (null == sessionId) {
                sessionId = UUID.randomUUID().toString().replace("-", "");
                httpExchange.getResponseHeaders().add("Set-Cookie", KEY_JSESSIONID + "=" + sessionId + ";path=/;HttpOnly");
            }
            this.sessionId = sessionId;
        }

        public String getMethod() {
            return httpExchange.getRequestMethod();
        }

        public String getPath() {
            return httpExchange.getRequestURI().getPath();
        }

        public String getReqHeader(String headerKey) {
            return httpExchange.getRequestHeaders().getFirst(headerKey);
        }

        public String getURLParameter(String paramKey) {
            return Strings.getParam(httpExchange.getRequestURI().getQuery(), paramKey);
        }

        public URI getRequestURI() {
            return httpExchange.getRequestURI();
        }

        public String getAttribute(String attributeKey) {
            return (String) httpExchange.getAttribute(attributeKey);
        }

        public InputStream getRequestBody() {
            return httpExchange.getRequestBody();
        }

        public String getSessionId() {
            return sessionId;
        }

        public InetSocketAddress getRemoteAddress() {
            return httpExchange.getRemoteAddress();
        }
    }

    private class HttpHandlerAdapter implements HttpHandler {
        private final JavaHttpHandle httpHandle;

        public HttpHandlerAdapter(JavaHttpHandle httpHandle) {
            this.httpHandle = httpHandle;
        }

        @Override
        public void handle(HttpExchange httpExchange) throws IOException {
            JavaHttpRequest request = new JavaHttpRequest(httpExchange);
            JavaHttpResponse response = new JavaHttpResponse(httpExchange);
            try {
                httpHandle.handle(request, response);
            } catch (Exception e) {
                logger.error("handle error, path={}", request.getPath(), e);
            }
            if (response.notProccess) {
                response.setResponse(404, "page not found!".getBytes());
            }
        }
    }
}
