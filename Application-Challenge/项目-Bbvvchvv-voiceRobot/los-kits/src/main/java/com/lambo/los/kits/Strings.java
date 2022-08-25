package com.lambo.los.kits;

import java.io.StringReader;
import java.util.*;
import java.util.Map.Entry;
import java.util.regex.Pattern;

/**
 * 字符操作
 *
 * @author 林小宝 create : 2015年7月5日下午4:28:01
 */
public class Strings {

    private static final Pattern INTEGER_PATTERN = Pattern.compile("-?[0-9]{1,10}");
    private static final Pattern DOUBLE_PATTERN = Pattern.compile("-?[0-9]+.?[0-9]+");
    private static final Pattern MOBILE_PATTERN = Pattern.compile("1[0-9]{10}");
    private static final Pattern MAIL_PATTERN = Pattern.compile("^([a-zA-Z0-9_\\-\\.]+)@((\\[[0-9]{1,3}\\.[0-9]{1,3}\\.[0-9]{1,3}\\.)|(([a-zA-Z0-9\\-]+\\.)+))([a-zA-Z]{2,4}|[0-9]{1,3})(\\]?)$");
    private static final Pattern IP_PATTERN = Pattern.compile("\\b((?!\\d\\d\\d)\\d+|1\\d\\d|2[0-4]\\d|25[0-5])\\.((?!\\d\\d\\d)\\d+|1\\d\\d|2[0-4]\\d|25[0-5])\\.((?!\\d\\d\\d)\\d+|1\\d\\d|2[0-4]\\d|25[0-5])\\.((?!\\d\\d\\d)\\d+|1\\d\\d|2[0-4]\\d|25[0-5])\\b");
    private static final String FOLDER_SEPARATOR = "/";
    private static final String WINDOWS_FOLDER_SEPARATOR = "\\";
    private static final String TOP_PATH = "..";
    private static final String CURRENT_PATH = ".";
    private static final char EXTENSION_SEPARATOR = '.';

    /**
     * 判空 2015年7月5日
     *
     * @param str
     * @return
     */
    public static boolean isNull(String str) {
        return null == str || str.isEmpty();
    }

    public static boolean isBlank(String text) {
        return isNull(text) || text.trim().isEmpty();
    }

    public static boolean isMobile(String str) {
        return null != str && MOBILE_PATTERN.matcher(str.trim()).matches();
    }

    public static boolean isIP(String str) {
        return null != str && IP_PATTERN.matcher(str.trim()).matches();
    }

    public static boolean isEMail(String str) {
        return null != str && MAIL_PATTERN.matcher(str.trim()).matches();
    }

    public static boolean isInteger(String str) {
        return null != str && INTEGER_PATTERN.matcher(str).matches();
    }

    public static boolean isDouble(String str) {
        return null != str && DOUBLE_PATTERN.matcher(str).matches();
    }

    /**
     * 快速获取json串中的值 2015年7月5日
     *
     * @param json
     * @param key
     * @return
     */
    public static final String getFromJson(String json, String key) {
        int i = json.indexOf("\"" + key + "\"") + key.length() + 2;
        String value = json.substring(i).trim();
        StringBuffer sb = new StringBuffer();
        if (!value.trim().startsWith(":")) {
            return sb.toString();
        }
        value = value.trim().substring(1);
        String tmp;
        if (value.startsWith("\"")) {
            value = value.substring(1);
            while (-1 < (i = value.indexOf("\""))) {
                tmp = value.substring(0, i);
                value = value.substring(i + 1);
                if (tmp.endsWith("\\")) {
                    sb.append(tmp.substring(0, tmp.length() - 1)).append("\"");
                } else {
                    sb.append(tmp);
                    break;
                }
            }
        } else {
            if (-1 < (i = value.indexOf("\""))) {
                sb.append(value.substring(0, i));
            } else if (-1 < (i = value.indexOf("}"))) {
                sb.append(value.substring(0, i));
            }
        }

        String result = sb.toString().trim();
        if (result.endsWith(",") && !value.startsWith(",")) {
            result = result.substring(0, result.length() - 1).trim();
        }
        return result;
    }

    /**
     * 处理参数，主要是将 ${key}这类格式的参数替换为map中的值 2015年7月5日
     *
     * @param str
     * @param params
     * @return
     */
    public static final String processParam(String str, Map<String, Object> params) {
        String tmp = str;
        String kt;
        if (null == params) {
            params = new HashMap<>();
        }
        for (Entry<String, Object> entry : params.entrySet()) {
            kt = "${" + entry.getKey() + "}";
            if (tmp.contains(kt)) {
                tmp = tmp.replace(kt, String.valueOf(entry.getValue()));
            }
        }
        return tmp;
    }

    /**
     * 分解String 2015年7月5日
     *
     * @param tmp
     * @param spliter
     * @return
     */
    public static final List<String> split(String tmp, final String spliter) {
        List<String> sqlList = new ArrayList<String>();
        tmp = tmp.trim();
        char[] cc = tmp.toCharArray();
        char[] dd = spliter.toCharArray();
        int len = cc.length;
        StringBuffer result = new StringBuffer(len);
        boolean in = false;
        char c = ' ';
        int rsLen = 0;
        for (int i = 0; i < len; i++) {
            c = cc[i];
            if (c == dd[0] && !in) {
                int j = i;
                for (char d : dd) {
                    if (j < len && cc[j++] != d) {
                        break;
                    }
                }
                if ((j - i) == dd.length) {
                    // rsLen = result.length();
                    // if (rsLen > 0) {
                    // result.setLength(rsLen - 1);
                    // }
                    sqlList.add(result.toString());
                    result.setLength(0);
                    i = j - 1;
                    continue;
                }
            }
            result.append(c);
            if ('\\' == c) {
                result.append(cc[i++]);
                continue;
            }
            if ('\'' == c) {
                in = !in;
            }

            if (' ' == c && !in) {
                rsLen = result.length();
                if (rsLen > 1 && ' ' == result.charAt(rsLen - 2)) {
                    result.setLength(rsLen - 1);
                }
            }

        }
        sqlList.add(result.toString());
        return sqlList;
    }

    public static String trimQuotes(String ss) {
        if (null != ss) {
            ss = ss.trim();
            if (ss.startsWith("'") && ss.endsWith("'")) {
                return ss.substring(1, ss.length() - 1);
            }
            if (ss.startsWith("\"") && ss.endsWith("\"")) {
                return ss.substring(1, ss.length() - 1);
            }
        }
        return ss;
    }

    public static final boolean trueOrFalse(String where, String[] fields, String[] values) {
        if (null != where && null != fields && null != values && fields.length == values.length) {
            String[] ss = where.split("&&");
            if (ss.length > 1) {
                for (String str : ss) {
                    if (!trueOrFalse(str, fields, values)) {
                        return false;
                    }
                }
                return true;
            }
            ss = where.split("\\|\\|");
            if (ss.length > 1) {
                for (String str : ss) {
                    if (trueOrFalse(str, fields, values)) {
                        return true;
                    }
                }
                return false;
            }
            ss = where.split("like");
            if (ss.length == 2) {
                int i = -1;
                String key = ss[0].trim();
                for (String str : fields) {
                    i++;
                    if (key.equals(str)) {
                        break;
                    }
                }
                if (i > -1) {
                    String value = String.valueOf(values[i]);
                    String like = trimQuotes(ss[ss.length - 1]).trim();
                    return null != value && value.contains(like);
                }
                return false;
            }
            if (where.endsWith("is null")) {
                int i = -1;
                String key = where.substring(0, where.indexOf("is null")).trim();
                for (String str : fields) {
                    i++;
                    if (key.equals(str)) {
                        break;
                    }
                }
                if (i > -1) {
                    return null == values[i] || "".equals(values[i]);
                }
                return false;
            }

            ss = where.split("[><=]");
            if (ss.length >= 2) {
                int i = -1;
                String key = ss[0].trim();
                for (String str : fields) {
                    i++;
                    if (key.equals(str)) {
                        break;
                    }
                }
                if (i > -1) {
                    String value = String.valueOf(values[i]);
                    int compareTo = trimQuotes(ss[ss.length - 1]).trim().compareTo(value);
                    boolean result = false;
                    if (where.contains("=")) {
                        result = (compareTo == 0);
                        if (where.contains("!")) {
                            result = !result;
                        }
                    }
                    if (!result && where.contains(">")) {
                        result = (compareTo < 0);
                    }
                    if (!result && where.contains("<")) {
                        result = (compareTo > 0);
                    }
                    return result;
                }
            }
        }
        return false;
    }


    public static String getParam(String queryString, String key) {
        String result = null;
        if (null != queryString) {
            int i = queryString.indexOf(key + "=");
            if (i > -1) {
                i = i + key.length() + 1;
                queryString = queryString.substring(i);
                i = queryString.indexOf("&");
                if (i > -1) {
                    queryString = queryString.substring(0, queryString.indexOf("&"));
                }
                result = queryString;
            }
        }
        return result;
    }

    /**
     * 首字母变小写
     */
    public static String firstCharToLowerCase(String str) {
        Character firstChar = str.charAt(0);
        String tail = str.substring(1);
        str = Character.toLowerCase(firstChar) + tail;
        return str;
    }


    /**
     * 按参数格式转换为map.
     *
     * @param parameterMap
     * @param query
     * @return
     */
    public static Map<String, List<String>> processQuery(Map<String, List<String>> parameterMap, String query) {
        if (null == parameterMap) {
            parameterMap = new HashMap<>();
        }
        Scanner scanner = new Scanner(new StringReader(query));
        scanner.useDelimiter("&");
        String field = null;
        String value = null;
        while (scanner.hasNext()) {
            String line = scanner.next();
            int i = line.indexOf("=");
            if (i > 0) {
                field = line.substring(0, i);
                value = line.substring(i + 1);
                List<String> values = parameterMap.get(field);
                if (null == values) {
                    values = new ArrayList<>();
                    parameterMap.put(field, values);
                }
                values.add(value);
            } else {
                value += "&" + line;
                if (null != field) {
                    List<String> values = parameterMap.get(field);
                    values.set(values.size() - 1, value);
                }
            }
        }
        scanner.close();
        return parameterMap;
    }

    public static String getStrFromTo(String src, String start, String end) {
        if (isBlank(src)) {
            return null;
        }
        int i = src.indexOf(start);
        if (i < 0) {
            return null;
        }
        src = src.substring(i + start.length());
        if (src.contains(end)) {
            return src.substring(0, src.indexOf(end));
        }
        return src;
    }


    /**
     * Tokenize the given String into a String array via a StringTokenizer.
     * <p>The given delimiters string is supposed to consist of any number of
     * delimiter characters. Each of those characters can be used to separate
     * tokens. A delimiter is always a single character; for multi-character
     * delimiters, consider using {@code delimitedListToStringArray}
     *
     * @param str               the String to tokenize
     * @param delimiters        the delimiter characters, assembled as String
     *                          (each of those characters is individually considered as delimiter)
     * @param trimTokens        trim the tokens via String's {@code trim}
     * @param ignoreEmptyTokens omit empty tokens from the result array
     *                          (only applies to tokens that are empty after trimming; StringTokenizer
     *                          will not consider subsequent delimiters as token in the first place).
     * @return an array of the tokens ({@code null} if the input String
     * was {@code null})
     * @see java.util.StringTokenizer
     * @see String#trim()
     */
    public static String[] tokenizeToStringArray(
            String str, String delimiters, boolean trimTokens, boolean ignoreEmptyTokens) {

        if (str == null) {
            return null;
        }
        StringTokenizer st = new StringTokenizer(str, delimiters);
        List<String> tokens = new ArrayList<>();
        while (st.hasMoreTokens()) {
            String token = st.nextToken();
            if (trimTokens) {
                token = token.trim();
            }
            if (!ignoreEmptyTokens || token.length() > 0) {
                tokens.add(token);
            }
        }
        return tokens.toArray(new String[tokens.size()]);
    }

    /**
     * Normalize the path by suppressing sequences like "path/.." and
     * inner simple dots.
     * <p>The result is convenient for path comparison. For other uses,
     * notice that Windows separators ("\") are replaced by simple slashes.
     *
     * @param path the original path
     * @return the normalized path
     */
    public static String cleanPath(String path) {
        if (path == null) {
            return null;
        }
        String pathToUse = path.replace(WINDOWS_FOLDER_SEPARATOR, FOLDER_SEPARATOR);
        return pathToUse.replace("../", "").replace("./", "");
    }

    public static String getFilename(String path) {
        if (path == null) {
            return null;
        }
        int separatorIndex = path.lastIndexOf(FOLDER_SEPARATOR);
        return (separatorIndex != -1 ? path.substring(separatorIndex + 1) : path);
    }

    /**
     * Apply the given relative path to the given path,
     * assuming standard Java folder separation (i.e. "/" separators).
     *
     * @param path         the path to start from (usually a full file path)
     * @param relativePath the relative path to apply
     *                     (relative to the full file path above)
     * @return the full file path that results from applying the relative path
     */
    public static String applyRelativePath(String path, String relativePath) {
        int separatorIndex = path.lastIndexOf(FOLDER_SEPARATOR);
        if (separatorIndex != -1) {
            String newPath = path.substring(0, separatorIndex);
            if (!relativePath.startsWith(FOLDER_SEPARATOR)) {
                newPath += FOLDER_SEPARATOR;
            }
            return newPath + relativePath;
        } else {
            return relativePath;
        }
    }

    /**
     * Replace all occurrences of a substring within a string with
     * another string.
     *
     * @param inString   String to examine
     * @param oldPattern String to replace
     * @param newPattern String to insert
     * @return a String with the replacements
     */
    public static String replace(String inString, String oldPattern, String newPattern) {
        if (isNull(inString) || isNull(oldPattern) || newPattern == null) {
            return inString;
        }
        StringBuilder sb = new StringBuilder();
        int pos = 0; // our position in the old string
        int index = inString.indexOf(oldPattern);
        // the index of an occurrence we've found, or -1
        int patLen = oldPattern.length();
        while (index >= 0) {
            sb.append(inString.substring(pos, index));
            sb.append(newPattern);
            pos = index + patLen;
            index = inString.indexOf(oldPattern, pos);
        }
        sb.append(inString.substring(pos));
        // remember to append any characters to the right of a match
        return sb.toString();
    }
}
