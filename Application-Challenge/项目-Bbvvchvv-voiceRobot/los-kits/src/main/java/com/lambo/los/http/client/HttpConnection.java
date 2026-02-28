package com.lambo.los.http.client;

import com.lambo.los.kits.BizException;

import javax.net.ssl.*;
import java.io.*;
import java.net.*;
import java.nio.ByteBuffer;
import java.nio.charset.Charset;
import java.security.KeyManagementException;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.security.cert.CertificateException;
import java.security.cert.X509Certificate;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.zip.GZIPInputStream;


@SuppressWarnings("all")
public class HttpConnection {

    /**
     * 添加一些默认的cookie,使得访问可复用.
     *
     * @param urlString url地址..
     * @param name      名称.
     * @param value     值.
     */
    public static void addCookie(String urlString, String name, String value) throws URISyntaxException {
        URI httpUri = new URI(urlString);
        CookieManager cookieManager = (CookieManager) CookieHandler.getDefault();
        if (null == cookieManager) {
            cookieManager = new CookieManager();
            CookieHandler.setDefault(cookieManager);
        }
        HttpCookie cookie = new HttpCookie(name, value);
        cookie.setPath(httpUri.getPath());
        cookie.setDomain(httpUri.getHost());
        cookieManager.getCookieStore().add(httpUri, cookie);
    }

    public static final Map<String, String> defaultHeader = new HashMap<>();

    public static void setDefaultHeader(String name, String value) {
        if (null != name && !name.isEmpty() && null != value && !value.isEmpty()) {
            defaultHeader.put(name, value);
        }
    }

    public enum Method {
        GET, POST, HEAD, PUT, TRACE, OPTIONS, DELETE, LOCK, MKCOL, MOVE
    }

    public static HttpConnection connect(String url) {
        HttpConnection con = new HttpConnection();
        con.url(url);
        return con;
    }

    public static HttpConnection connect(URL url) {
        HttpConnection con = new HttpConnection();
        con.url(url);
        return con;
    }

    private Request req;
    private Response res;

    private HttpConnection() {
        req = new Request();
        res = new Response();
    }

    public HttpConnection url(URL url) {
        req.url(url);
        return this;
    }

    public HttpConnection url(String url) {
        HttpKit.notEmpty(url, "Must supply a valid URL");
        try {
            req.url(new URL(url));
        } catch (MalformedURLException e) {
            throw new IllegalArgumentException("Malformed URL: " + url, e);
        }
        return this;
    }

    public HttpConnection proxy(Proxy proxy) {
        req.proxy(proxy);
        return this;
    }

    public HttpConnection userAgent(String userAgent) {
        HttpKit.notNull(userAgent, "User agent must not be null");
        req.header("User-Agent", userAgent);
        return this;
    }

    public HttpConnection connTimeout(int millis) {
        req.connTimeoutMs(millis);
        return this;
    }

    public HttpConnection timeout(int millis) {
        req.connTimeoutMs(millis);
        req.readTimeoutMs(millis);
        return this;
    }

    /**
     * 设置超时.
     *
     * @param millis
     * @return
     */
    public HttpConnection readTimeout(int millis) {
        req.readTimeoutMs(millis);
        return this;
    }

    /**
     * 最大请求参数大小.
     *
     * @param bytes
     * @return
     */
    public HttpConnection maxBodySize(int bytes) {
        req.maxBodySize(bytes);
        return this;
    }

    public HttpConnection followRedirects(boolean followRedirects) {
        req.followRedirects(followRedirects);
        return this;
    }

    public HttpConnection referrer(String referrer) {
        HttpKit.notNull(referrer, "Referrer must not be null");
        req.header("Referer", referrer);
        return this;
    }

    public HttpConnection method(Method method) {
        req.method(method);
        return this;
    }

    public HttpConnection ignoreHttpErrors(boolean ignoreHttpErrors) {
        req.ignoreHttpErrors(ignoreHttpErrors);
        return this;
    }

    public HttpConnection ignoreContentType(boolean ignoreContentType) {
        req.ignoreContentType(ignoreContentType);
        return this;
    }

    public HttpConnection data(String key, String value) {
        req.data(KeyVal.create(key, value));
        return this;
    }

    public HttpConnection postData(byte[] postData) {
        req.postData = postData;
        if (null == req.method()) {
            req.setMethod(Method.POST);
        }
        return this;
    }

    public HttpConnection data(Map<String, String> data) {
        HttpKit.notNull(data, "Data map must not be null");
        for (Map.Entry<String, String> entry : data.entrySet()) {
            req.data(KeyVal.create(entry.getKey(), entry.getValue()));
        }
        return this;
    }

    public HttpConnection data(String... keyVals) {
        HttpKit.notNull(keyVals, "Data key value pairs must not be null");
        HttpKit.isTrue(keyVals.length % 2 == 0, "Must supply an even number of key value pairs");
        for (int i = 0; i < keyVals.length; i += 2) {
            String key = keyVals[i];
            String value = keyVals[i + 1];
            HttpKit.notEmpty(key, "Data key must not be empty");
            HttpKit.notNull(value, "Data value must not be null");
            req.data(KeyVal.create(key, value));
        }
        return this;
    }

    public HttpConnection header(String name, String value) {
        req.header(name, value);
        return this;
    }

    public HttpConnection cookie(String name, String value) {
        req.cookie(name, value);
        return this;
    }

    public HttpConnection cookies(Map<String, String> cookies) {
        HttpKit.notNull(cookies, "Cookie map must not be null");
        for (Map.Entry<String, String> entry : cookies.entrySet()) {
            req.cookie(entry.getKey(), entry.getValue());
        }
        return this;
    }

    public Response execute() throws IOException {
        res = Response.execute(req);
        return res;
    }

    public Request request() {
        return req;
    }

    public HttpConnection request(Request request) {
        req = request;
        return this;
    }

    public Response response() {
        return res;
    }

    public HttpConnection response(Response response) {
        res = response;
        return this;
    }

    @SuppressWarnings({"all"})
    private static class Base<T extends Base> {
        private URL url;
        private Method method;
        private Map<String, String> headers;
        private Map<String, String> cookies;

        private Base() {
            headers = new LinkedHashMap<String, String>();
            cookies = new LinkedHashMap<String, String>();
        }

        public URL url() {
            return url;
        }

        public T url(URL url) {
            HttpKit.notNull(url, "URL must not be null");
            this.url = url;
            return (T) this;
        }

        public Method method() {
            return method;
        }

        public T method(Method method) {
            HttpKit.notNull(method, "Method must not be null");
            this.method = method;
            return (T) this;
        }

        public String header(String name) {
            HttpKit.notNull(name, "Header name must not be null");
            return getHeaderCaseInsensitive(name);
        }

        public T header(String name, String value) {
            HttpKit.notEmpty(name, "Header name must not be empty");
            HttpKit.notNull(value, "Header value must not be null");
            //ensures we don't get an "accept-encoding" and a "Accept-Encoding"
            removeHeader(name);
            headers.put(name, value);
            return (T) this;
        }

        public boolean hasHeader(String name) {
            HttpKit.notEmpty(name, "Header name must not be empty");
            return getHeaderCaseInsensitive(name) != null;
        }

        public T removeHeader(String name) {
            HttpKit.notEmpty(name, "Header name must not be empty");
            // remove is case insensitive too
            Map.Entry<String, String> entry = scanHeaders(name);
            if (entry != null) {
                // ensures correct case
                headers.remove(entry.getKey());
            }
            return (T) this;
        }

        public Map<String, String> headers() {
            return headers;
        }

        private String getHeaderCaseInsensitive(String name) {
            HttpKit.notNull(name, "Header name must not be null");
            // quick evals for common case of title case, lower case, then scan
            // for mixed
            String value = headers.get(name);
            if (value == null) {
                value = headers.get(name.toLowerCase());
            }
            if (value == null) {
                Map.Entry<String, String> entry = scanHeaders(name);
                if (entry != null) {
                    value = entry.getValue();
                }
            }
            return value;
        }

        private Map.Entry<String, String> scanHeaders(String name) {
            String lc = name.toLowerCase();
            for (Map.Entry<String, String> entry : headers.entrySet()) {
                if (entry.getKey().toLowerCase().equals(lc)) {
                    return entry;
                }
            }
            return null;
        }

        public String cookie(String name) {
            HttpKit.notNull(name, "Cookie name must not be null");
            return cookies.get(name);
        }

        public T cookie(String name, String value) {
            HttpKit.notEmpty(name, "Cookie name must not be empty");
            HttpKit.notNull(value, "Cookie value must not be null");
            cookies.put(name, value);
            return (T) this;
        }

        public boolean hasCookie(String name) {
            HttpKit.notEmpty("Cookie name must not be empty");
            return cookies.containsKey(name);
        }

        public T removeCookie(String name) {
            HttpKit.notEmpty("Cookie name must not be empty");
            cookies.remove(name);
            return (T) this;
        }

        public Map<String, String> cookies() {
            return cookies;
        }

        public URL getUrl() {
            return url;
        }

        public Method getMethod() {
            return method;
        }

        public Map<String, String> getHeaders() {
            return headers;
        }

        public Map<String, String> getCookies() {
            return cookies;
        }

        public void setUrl(URL url) {
            this.url = url;
        }

        public void setMethod(Method method) {
            this.method = method;
        }

        public void setHeaders(Map<String, String> headers) {
            this.headers = headers;
        }

        public void setCookies(Map<String, String> cookies) {
            this.cookies = cookies;
        }
    }

    public static class Request extends Base<Request> {
        private int connTimeoutMs;
        private int readTimeoutMs;
        private int maxBodySizeBytes;
        private boolean followRedirects;
        private Collection<KeyVal> data;
        private boolean ignoreHttpErrors = false;
        private boolean ignoreContentType = false;
        private byte[] postData;
        private Proxy proxy;

        private Request() {
            connTimeoutMs = 6000;
            readTimeoutMs = 30000;
            maxBodySizeBytes = 1024 * 1024; // 1MB
            followRedirects = true;
            data = new ArrayList<>();
            getHeaders().put("Accept-Encoding", "gzip");
        }

        public Request connTimeoutMs(int connTimeoutMs) {
            HttpKit.isTrue(connTimeoutMs >= 0, "Timeout milliseconds must be 0 (infinite) or greater");
            this.connTimeoutMs = connTimeoutMs;
            return this;
        }

        public Request readTimeoutMs(int readTimeoutMs) {
            HttpKit.isTrue(readTimeoutMs >= 0, "Timeout milliseconds must be 0 (infinite) or greater");
            this.readTimeoutMs = readTimeoutMs;
            return this;
        }

        public int maxBodySize() {
            return maxBodySizeBytes;
        }

        public Request maxBodySize(int bytes) {
            HttpKit.isTrue(bytes >= 0, "maxSize must be 0 (unlimited) or larger");
            maxBodySizeBytes = bytes;
            return this;
        }

        public void proxy(Proxy proxy) {
            this.proxy = proxy;
        }

        public Proxy proxy() {
            return proxy;
        }

        public boolean followRedirects() {
            return followRedirects;
        }

        public Request followRedirects(boolean followRedirects) {
            this.followRedirects = followRedirects;
            return this;
        }

        public boolean ignoreHttpErrors() {
            return ignoreHttpErrors;
        }

        public Request ignoreHttpErrors(boolean ignoreHttpErrors) {
            this.ignoreHttpErrors = ignoreHttpErrors;
            return this;
        }

        public boolean ignoreContentType() {
            return ignoreContentType;
        }

        public Request ignoreContentType(boolean ignoreContentType) {
            this.ignoreContentType = ignoreContentType;
            return this;
        }

        public Request data(KeyVal keyVal) {
            HttpKit.notNull(keyVal, "Key val must not be null");
            data.add(keyVal);
            return this;
        }

        public Collection<KeyVal> data() {
            return data;
        }
    }

    public static class Response extends Base<Response> {
        private static final int MAX_REDIRECTS = 20;
        private int statusCode;
        private String statusMessage;
        private ByteBuffer byteData;
        private String charset;
        private String contentType;
        private boolean executed = false;
        private int numRedirects = 0;

        Response() {
            super();
        }

        public int statusCode() {
            return statusCode;
        }

        public String statusMessage() {
            return statusMessage;
        }

        public String charset() {
            return charset;
        }

        private Response(Response previousResponse) throws IOException {
            super();
            if (previousResponse != null) {
                numRedirects = previousResponse.numRedirects + 1;
                if (numRedirects >= MAX_REDIRECTS) {
                    throw new IOException(
                            String.format("Too many redirects occurred trying to load URL %s", previousResponse.url()));
                }
            }
        }

        static Response execute(Request req) throws IOException {
            return execute(req, null);
        }

        static Response execute(Request req, Response previousResponse) throws IOException {
            if (req.getMethod() == null) {
                req.method(Method.GET);
            }
            HttpKit.notNull(req, "Request must not be null");
            String protocol = req.url().getProtocol();
            if (!protocol.equals("http") && !protocol.equals("https")) {
                throw new MalformedURLException("Only http & https protocols supported");
            }

            // set up the request for execution
            if (req.method() == Method.GET && req.data().size() > 0) {
                serialiseRequestUrl(req); // appends query string
            }

            if (req.method() == Method.POST && req.data().size() > 0 && null != req.postData && req.postData.length > 0) {
                serialiseRequestUrl(req); // appends query string
            }
            HttpURLConnection conn = createConnection(req);
            Response res;
            try {
                conn.connect();
                if (req.method() == Method.POST || req.method() == Method.PUT) {
                    if (null != req.postData && req.postData.length > 0) {
                        writePost(req.postData, conn.getOutputStream());
                    } else {
                        writePost(req.data(), conn.getOutputStream());
                    }
                }

                int status = conn.getResponseCode();
                boolean needsRedirect = false;
                if (status != HttpURLConnection.HTTP_OK) {
                    if (status == HttpURLConnection.HTTP_MOVED_TEMP || status == HttpURLConnection.HTTP_MOVED_PERM
                            || status == HttpURLConnection.HTTP_SEE_OTHER) {
                        needsRedirect = true;
                    } else if (!req.ignoreHttpErrors()) {
                        throw new HttpStatusException("HTTP error fetching URL", status, req.url().toString());
                    }
                }
                res = new Response(previousResponse);
                res.setupFromConnection(conn, previousResponse);
                if (needsRedirect && req.followRedirects()) {
                    // always redirect with a get. any
                    req.method(Method.GET);
                    // data param from original req are dropped.
                    req.data().clear();
                    req.url(new URL(req.url(), res.header("Location")));
                    // add response cookies to request (for e.g. login posts)
                    for (Map.Entry<String, String> cookie : res.getCookies().entrySet()) {
                        req.cookie(cookie.getKey(), cookie.getValue());
                    }
                    return execute(req, res);
                }
                // check that we can handle the returned content type; if not,
                // abort before fetching it
                String contentType = res.contentType;
                if (contentType != null && !req.ignoreContentType()
                        && (!(contentType.startsWith("text/") || contentType.startsWith("application/xml")
                        || contentType.startsWith("application/xhtml+xml")))) {
                    throw new UnsupportedMimeTypeException(
                            "Unhandled content type. Must be text/*, application/xml, or application/xhtml+xml",
                            contentType, req.url().toString());
                }

                InputStream bodyStream = null;
                InputStream dataStream = null;
                try {
                    dataStream = conn.getErrorStream() != null ? conn.getErrorStream() : conn.getInputStream();
                    bodyStream = res.hasHeader("Content-Encoding")
                            && res.header("Content-Encoding").equalsIgnoreCase("gzip")
                            ? new BufferedInputStream(new GZIPInputStream(dataStream))
                            : new BufferedInputStream(dataStream);

                    res.byteData = HttpKit.readToByteBuffer(bodyStream, req.maxBodySize());
                    // may be null,readInputStream deals with it.
                    res.charset = HttpKit.getCharsetFromContentType(res.contentType);
                } finally {
                    if (bodyStream != null) {
                        bodyStream.close();
                    }
                    if (dataStream != null) {
                        dataStream.close();
                    }
                }
            } finally {
                // per Java's documentation, this is not necessary, and
                // precludes keepalives. However in practise,
                // connection errors will not be released quickly enough and can
                // cause a too many open files error.
                conn.disconnect();
            }
            res.executed = true;
            return res;
        }

        public byte[] bodyAsBytes() {
            HttpKit.isTrue(executed,
                    "Request must be executed (with .execute(), .get(), or .post() before getting response body");
            return byteData.array();
        }

        // set up connection defaults, and details from request
        private static HttpURLConnection createConnection(Request req) throws IOException {
            HttpURLConnection conn;
            if (null != req.proxy) {
                conn = (HttpURLConnection) req.url().openConnection(req.proxy);
            } else {
                conn = (HttpURLConnection) req.url().openConnection();
            }
            conn.setRequestMethod(req.method().name());
            conn.setInstanceFollowRedirects(false); // don't rely on native
            // redirection support
            conn.setConnectTimeout(req.connTimeoutMs);
            conn.setReadTimeout(req.readTimeoutMs);

            if (conn instanceof HttpsURLConnection) {
                HttpsURLConnection httpsConn = (HttpsURLConnection) conn;
                initHttpsSSLFactory(httpsConn);
            }
            if (req.method() == Method.POST || req.method() == Method.PUT) {
                conn.setDoOutput(true);
            }
            if (req.cookies().size() > 0) {
                conn.addRequestProperty("Cookie", getRequestCookieString(req));
            }
            Map<String, String> headers = new HashMap<>();
            headers.putAll(defaultHeader);
            headers.putAll(req.headers());
            for (Map.Entry<String, String> header : headers.entrySet()) {
                conn.addRequestProperty(header.getKey(), header.getValue());
            }
            return conn;
        }

        private static void initHttpsSSLFactory(HttpsURLConnection httpsConn) {
            try {
                httpsConn.setHostnameVerifier(new HostnameVerifier() {
                    public boolean verify(String s, SSLSession sslSession) {
                        return true;
                    }
                });
                SSLContext sslcontext = SSLContext.getInstance("TLS");
                sslcontext.init(null,
                        new X509TrustManager[]{new X509TrustManager() {
                            @Override
                            public void checkClientTrusted(X509Certificate[] x509Certificates, String s) throws CertificateException {
                            }

                            @Override
                            public void checkServerTrusted(X509Certificate[] x509Certificates, String s) throws CertificateException {
                            }

                            @Override
                            public X509Certificate[] getAcceptedIssuers() {
                                return new X509Certificate[0];
                            }
                        }},
                        new SecureRandom());
                SSLSocketFactory socketFactory = sslcontext.getSocketFactory();
                httpsConn.setSSLSocketFactory(socketFactory);
            } catch (NoSuchAlgorithmException | KeyManagementException e) {
                throw new BizException("initHttpsSSLFactory failed,", e);
            }
        }

        // set up url, method, header, cookies
        private void setupFromConnection(HttpURLConnection conn, Response previousResponse) throws IOException {
            setMethod(Method.valueOf(conn.getRequestMethod()));
            setUrl(conn.getURL());
            statusCode = conn.getResponseCode();
            statusMessage = conn.getResponseMessage();
            contentType = conn.getContentType();

            Map<String, List<String>> resHeaders = conn.getHeaderFields();
            processResponseHeaders(resHeaders);

            // if from a redirect, map previous response cookies into this
            // response
            if (previousResponse != null) {
                for (Map.Entry<String, String> prevCookie : previousResponse.cookies().entrySet()) {
                    if (!hasCookie(prevCookie.getKey())) {
                        cookie(prevCookie.getKey(), prevCookie.getValue());
                    }
                }
            }
        }

        void processResponseHeaders(Map<String, List<String>> resHeaders) {
            for (Map.Entry<String, List<String>> entry : resHeaders.entrySet()) {
                String name = entry.getKey();
                if (name == null) {
                    continue; // http/1.1 line
                }

                List<String> values = entry.getValue();
                if (name.equalsIgnoreCase("Set-Cookie")) {
                    for (String value : values) {
                        if (value == null) {
                            continue;
                        }
                        TokenQueue cd = new TokenQueue(value);
                        String cookieName = cd.chompTo("=").trim();
                        String cookieVal = cd.consumeTo(";").trim();
                        // ignores path, date, domain, secure et al. req'd?
                        // name not blank, value not null
                        if (cookieName.length() > 0 && !"\"\"".equals(cookieVal)) {
                            cookie(cookieName, cookieVal);
                        }
                    }
                } else { // only take the first instance of each header
                    if (!values.isEmpty()) {
                        header(name, values.get(0));
                    }
                }
            }
        }

        private static void writePost(Collection<KeyVal> data, OutputStream outputStream) throws IOException {
            OutputStreamWriter w = new OutputStreamWriter(outputStream, HttpKit.DEFAULT_CHARSET);
            boolean first = true;
            for (KeyVal keyVal : data) {
                if (!first) {
                    w.append('&');
                } else {
                    first = false;
                }
                w.write(URLEncoder.encode(keyVal.key, HttpKit.DEFAULT_CHARSET));
                w.write('=');
                w.write(URLEncoder.encode(keyVal.value, HttpKit.DEFAULT_CHARSET));
            }
            w.close();
        }

        private static void writePost(byte[] postData, OutputStream outputStream) throws IOException {
            outputStream.write(postData);
            outputStream.flush();
        }

        private static String getRequestCookieString(Request req) {
            StringBuilder sb = new StringBuilder();
            boolean first = true;
            for (Map.Entry<String, String> cookie : req.cookies().entrySet()) {
                if (!first) {
                    sb.append("; ");
                } else {
                    first = false;
                }
                sb.append(cookie.getKey()).append('=').append(cookie.getValue());
                // todo: spec says only ascii, no escaping / encoding defined.
                // validate on set? or escape somehow here?
            }
            return sb.toString();
        }

        // for get url reqs, serialise the data map into the url
        private static void serialiseRequestUrl(Request req) throws IOException {
            URL in = req.url();
            StringBuilder url = new StringBuilder();
            boolean first = true;
            // reconstitute the query, ready for appends
            url.append(in.getProtocol()).append("://").append(in.getAuthority()) // includes
                    // host,
                    // port
                    .append(in.getPath()).append("?");
            if (in.getQuery() != null) {
                url.append(in.getQuery());
                first = false;
            }
            for (KeyVal keyVal : req.data()) {
                if (!first) {
                    url.append('&');
                } else {
                    first = false;
                }
                url.append(URLEncoder.encode(keyVal.key, HttpKit.DEFAULT_CHARSET)).append('=')
                        .append(URLEncoder.encode(keyVal.value, HttpKit.DEFAULT_CHARSET));
            }
            req.url(new URL(url.toString()));
            req.data().clear(); // moved into url as get params
        }

        public String body() {
            HttpKit.isTrue(executed, "Request must be executed (with .execute(), .get(), or .post() before getting response body");
            // charset gets set from header on execute, and from meta-equiv on
            // parse. parse may not have happened yet
            String body;
            if (charset == null)
                body = Charset.forName(HttpKit.DEFAULT_CHARSET).decode(byteData)
                        .toString();
            else
                body = Charset.forName(charset).decode(byteData).toString();
            byteData.rewind();
            return body;
        }
    }

    public static class KeyVal {
        private String key;
        private String value;

        public static KeyVal create(String key, String value) {
            HttpKit.notEmpty(key, "Data key must not be empty");
            HttpKit.notNull(value, "Data value must not be null");
            return new KeyVal(key, value);
        }

        private KeyVal(String key, String value) {
            this.key = key;
            this.value = value;
        }

        public KeyVal key(String key) {
            HttpKit.notEmpty(key, "Data key must not be empty");
            this.key = key;
            return this;
        }

        public KeyVal value(String value) {
            HttpKit.notNull(value, "Data value must not be null");
            this.value = value;
            return this;
        }

        @Override
        public String toString() {
            return key + "=" + value;
        }
    }

    public static class HttpStatusException extends IOException {
        private static final long serialVersionUID = 5953024838454023016L;
        private int statusCode;
        private String url;

        public HttpStatusException(String message, int statusCode, String url) {
            super(message);
            this.statusCode = statusCode;
            this.url = url;
        }

        @Override
        public String toString() {
            return super.toString() + ". Status=" + statusCode + ", URL=" + url;
        }
    }

    public static class UnsupportedMimeTypeException extends IOException {
        private static final long serialVersionUID = -7201533089096636366L;
        private String mimeType;
        private String url;

        public UnsupportedMimeTypeException(String message, String mimeType, String url) {
            super(message);
            this.mimeType = mimeType;
            this.url = url;
        }

        @Override
        public String toString() {
            return super.toString() + ". Mimetype=" + mimeType + ", URL=" + url;
        }
    }

    public static final class HttpKit {

        /**
         * Read the input stream into a byte buffer.
         *
         * @param inStream the input stream to read from
         * @param maxSize  the maximum size in bytes to read from the stream. Set to
         *                 0 to be unlimited.
         * @return the filled byte buffer
         * @throws IOException if an exception occurs whilst reading from the input
         *                     stream.
         */
        static ByteBuffer readToByteBuffer(InputStream inStream, int maxSize) throws IOException {
            HttpKit.isTrue(maxSize >= 0, "maxSize must be 0 (unlimited) or larger");
            final boolean capped = maxSize > 0;
            byte[] buffer = new byte[BUFFER_SIZE];
            ByteArrayOutputStream outStream = new ByteArrayOutputStream(BUFFER_SIZE);
            int read;
            int remaining = maxSize;

            while (true) {
                read = inStream.read(buffer);
                if (read == -1) {
                    break;
                }
                if (capped) {
                    if (read > remaining) {
                        outStream.write(buffer, 0, remaining);
                        break;
                    }
                    remaining -= read;
                }
                outStream.write(buffer, 0, read);
            }

            return ByteBuffer.wrap(outStream.toByteArray());
        }

        /**
         * Parse out a charset from a content type header. If the charset is not
         * supported, returns null (so the default will kick in.)
         *
         * @param contentType e.g. "text/html; charset=EUC-JP"
         * @return "EUC-JP", or null if not found. Charset is trimmed and
         * uppercased.
         */
        static String getCharsetFromContentType(String contentType) {
            if (contentType == null) {
                return null;
            }
            Matcher m = CHARSET_PATTERN.matcher(contentType);
            if (m.find()) {
                String charset = m.group(1).trim();
                if (Charset.isSupported(charset)) {
                    return charset;
                }
                charset = charset.toUpperCase(Locale.ENGLISH);
                if (Charset.isSupported(charset)) {
                    return charset;
                }
            }
            return null;
        }

        /**
         * Validates that the object is not null
         *
         * @param obj object to test
         * @param msg message to output if validation fails
         */
        public static void notNull(Object obj, String msg) {
            if (obj == null) {
                throw new IllegalArgumentException(msg);
            }
        }

        /**
         * Validates that the value is true
         *
         * @param val object to test
         * @param msg message to output if validation fails
         */
        public static void isTrue(boolean val, String msg) {
            if (!val) {
                throw new IllegalArgumentException(msg);
            }
        }

        /**
         * Validates that the string is not empty
         *
         * @param string the string to test
         */
        public static void notEmpty(String string) {
            if (string == null || string.length() == 0) {
                throw new IllegalArgumentException("String must not be empty");
            }
        }

        /**
         * Validates that the string is not empty
         *
         * @param string the string to test
         * @param msg    message to output if validation fails
         */
        public static void notEmpty(String string, String msg) {
            if (string == null || string.length() == 0) {
                throw new IllegalArgumentException(msg);
            }
        }

        private static final Pattern CHARSET_PATTERN = Pattern.compile("(?i)\\bcharset=\\s*\"?([^\\s;\"]*)");
        static final String DEFAULT_CHARSET = "UTF-8"; // used if not found in
        // header or meta
        // charset
        private static final int BUFFER_SIZE = 0x20000; // ~130K.
    }

    /**
     * A character queue with parsing helpers.
     *
     * @author Jonathan Hedley
     */
    public static class TokenQueue {
        private String queue;
        private int pos = 0;

        /**
         * Create a new TokenQueue.
         *
         * @param data string of data to back queue.
         */
        public TokenQueue(String data) {
            HttpKit.notNull(data, "data must not be null");
            queue = data;
        }

        /**
         * Is the queue empty?
         *
         * @return true if no data left in queue.
         */
        public boolean isEmpty() {
            return remainingLength() == 0;
        }

        private int remainingLength() {
            return queue.length() - pos;
        }

        /**
         * Add a string to the start of the queue.
         *
         * @param seq string to add.
         */
        public void addFirst(String seq) {
            // not very performant, but an edge case
            queue = seq + queue.substring(pos);
            pos = 0;
        }

        /**
         * Tests if the next characters on the queue match the sequence. Case
         * insensitive.
         *
         * @param seq String to check queue for.
         * @return true if the next characters match.
         */
        public boolean matches(String seq) {
            return queue.regionMatches(true, pos, seq, 0, seq.length());
        }

        /**
         * Tests if the queue matches the sequence (as with match), and if they
         * do, removes the matched string from the queue.
         *
         * @param seq String to search for, and if found, remove from queue.
         * @return true if found and removed, false if not found.
         */
        public boolean matchChomp(String seq) {
            if (matches(seq)) {
                pos += seq.length();
                return true;
            } else {
                return false;
            }
        }

        /**
         * Consume one character off queue.
         *
         * @return first character on queue.
         */
        public char consume() {
            return queue.charAt(pos++);
        }

        /**
         * Pulls a string off the queue, up to but exclusive of the match
         * sequence, or to the queue running out.
         *
         * @param seq String to end on (and not include in return, but leave on
         *            queue). <b>Case sensitive.</b>
         * @return The matched data consumed from queue.
         */
        public String consumeTo(String seq) {
            int offset = queue.indexOf(seq, pos);
            if (offset != -1) {
                String consumed = queue.substring(pos, offset);
                pos += consumed.length();
                return consumed;
            } else {
                return remainder();
            }
        }

        /**
         * Pulls a string off the queue (like consumeTo), and then pulls off the
         * matched string (but does not return it).
         * <p>
         * If the queue runs out of characters before finding the seq, will
         * return as much as it can (and queue will go isEmpty() == true).
         *
         * @param seq String to match up to, and not include in return, and to
         *            pull off queue. <b>Case sensitive.</b>
         * @return Data matched from queue.
         */
        public String chompTo(String seq) {
            String data = consumeTo(seq);
            matchChomp(seq);
            return data;
        }

        /**
         * Consume and return whatever is left on the queue.
         *
         * @return remained of queue.
         */
        public String remainder() {
            StringBuilder accum = new StringBuilder();
            while (!isEmpty()) {
                accum.append(consume());
            }
            return accum.toString();
        }
    }
}
