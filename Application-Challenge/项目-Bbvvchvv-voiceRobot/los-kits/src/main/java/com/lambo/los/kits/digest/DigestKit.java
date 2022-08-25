package com.lambo.los.kits.digest;

import com.lambo.los.kits.Strings;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.nio.charset.Charset;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.zip.GZIPInputStream;
import java.util.zip.GZIPOutputStream;

public class DigestKit {
    private static Logger logger = LoggerFactory.getLogger(DigestKit.class);
    private static String DEFAULT_CHARSET = "UTF-8";

    /**
     * GZip解密
     *
     * @param src
     * @return
     * @throws IOException
     * @createTime 2015年1月4日 下午11:05:13
     */
    public static byte[] gzipDecode(byte[] src) throws IOException {
        ByteArrayOutputStream tmp = new ByteArrayOutputStream();
        GZIPInputStream in = new GZIPInputStream(new ByteArrayInputStream(src));
        byte[] bb = new byte[1024];
        int n = 0;
        while ((n = in.read(bb)) > 0) {
            tmp.write(bb, 0, n);
        }
        return tmp.toByteArray();
    }

    /**
     * Gzip加密
     *
     * @param src
     * @return
     * @throws IOException
     * @createTime 2015年1月4日 下午11:05:27
     */
    public static byte[] gzipEncode(byte[] src) throws IOException {
        ByteArrayOutputStream tmp = new ByteArrayOutputStream();
        GZIPOutputStream out = new GZIPOutputStream(tmp);
        out.write(src);
        out.finish();
        return tmp.toByteArray();
    }

    /**
     * MD5数字签名
     *
     * @param src
     * @return
     * @throws Exception
     */
    public static String md5Digest(String src) {
        return md5Digest(src, null);
    }

    /**
     * MD5数字签名
     *
     * @param src
     * @return
     * @throws Exception
     */
    public static String md5Digest(String src, String charsetName) {
        charsetName = null != charsetName ? charsetName : DEFAULT_CHARSET;
        return null != src ? new MD5().getMD5ofStr(src.getBytes(Charset.forName(charsetName))) : null;
    }

    /**
     * MD5数字签名
     *
     * @param data
     * @return
     * @throws Exception
     */
    public static String md5Digest(byte[] data) {
        return null != data ? new MD5().getMD5ofStr(data) : null;
    }

    public static String base64Encoder(String src) {
        return base64Encoder(src, null);
    }

    public static String base64Encoder(byte[] src) {
        if (null == src) {
            return null;
        }
        return Base64.encode(src);
    }

    public static String base64Encoder(String src, String charset) {
        if (null != src) {
            byte[] data = src.getBytes(Charset.forName(null != charset ? charset : DEFAULT_CHARSET));
            return base64Encoder(data);
        }
        return null;
    }

    public static byte[] base64Decoder(String src) {
        return Base64.decode(src);
    }

    public static String base64DecoderUTF8(String src) {
        return base64Decoder(src, DEFAULT_CHARSET);
    }

    public static String base64Decoder(String src, String charset) {
        if (null != src) {
            byte[] bytes = base64Decoder(src);
            return new String(bytes, Charset.forName(null != charset ? charset : DEFAULT_CHARSET));
        }
        return null;
    }

    public static String sha1Base64Encode(String in) {
        if (Strings.isBlank(in)) {
            return null;
        }
        try {
            MessageDigest messagedigest = MessageDigest.getInstance("SHA1");
            return Base64.encode(messagedigest.digest(in.getBytes()));
        } catch (NoSuchAlgorithmException e) {
            logger.error("SHA1编码出错！", e);
        }
        return null;
    }

    public static String aesEncrypt(String src, String key, String iv) throws Exception {
        return Base64.encode(AES.encrypt(src.getBytes(), key.getBytes(), iv.getBytes()));
    }

    public static String aesDecrypt(String src, String key, String iv) throws Exception {
        return new String(AES.decrypt(Base64.decode(src), key.getBytes(), iv.getBytes()));
    }
}
