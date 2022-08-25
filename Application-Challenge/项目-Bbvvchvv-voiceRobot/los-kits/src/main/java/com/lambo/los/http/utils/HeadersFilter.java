package com.lambo.los.http.utils;

import com.sun.net.httpserver.Headers;
import com.sun.net.httpserver.HttpExchange;

import java.io.IOException;
import java.lang.reflect.Field;
import java.util.*;

/**
 * 修改response header的数据
 * Created by zenglb on 2016/12/21.
 */
@SuppressWarnings("all")
public class HeadersFilter extends com.sun.net.httpserver.Filter {
    private static Field headerMap = null;

    static {
        try {
            headerMap = Headers.class.getDeclaredField("map");
            headerMap.setAccessible(true);
        } catch (NoSuchFieldException e) {
            e.printStackTrace();
        }
    }

    @Override
    public void doFilter(HttpExchange httpExchange, Chain chain) throws IOException {
        try {
            Object responseHeaders = httpExchange.getResponseHeaders();
            Map<String, List<String>> headers = (Map<String, List<String>>) headerMap.get(responseHeaders);
            headerMap.set(responseHeaders, new HashMap<String, List<String>>(headers) {
                public Set<Entry<String, List<String>>> entrySet() {
                    Set<Entry<String, List<String>>> result = new HashSet<>();
                    super.entrySet().stream().forEach(stringListEntry -> {
                        result.add(new Entry<String, List<String>>() {
                            public String getKey() {
                                return normalize(stringListEntry.getKey());
                            }

                            public List<String> getValue() {
                                return stringListEntry.getValue();
                            }

                            public List<String> setValue(List<String> value) {
                                return stringListEntry.setValue(value);
                            }
                        });
                    });
                    return result;
                }
            });
        } catch (Exception e) {
            e.printStackTrace();
        }
        chain.doFilter(httpExchange);
    }

    @Override
    public String description() {
        return getClass().getSimpleName();
    }

    private static String normalize(String key) {
        if (key == null) {
            return null;
        }
        int len = key.length();
        if (len == 0) {
            return key;
        }
        char[] b = key.toCharArray();
        if (b[0] >= 'a' && b[0] <= 'z') {
            b[0] = (char) (b[0] - ('a' - 'A'));
        }
        for (int i = 1; i < len; i++) {
            if (b[i - 1] == '-' && b[i] >= 'a' && b[i] <= 'z') {
                b[i] = (char) (b[i] - ('a' - 'A'));
            } else if (b[i] >= 'A' && b[i] <= 'Z') {
                b[i] = (char) (b[i] + ('a' - 'A'));
            }
        }
        return new String(b);
    }
}
