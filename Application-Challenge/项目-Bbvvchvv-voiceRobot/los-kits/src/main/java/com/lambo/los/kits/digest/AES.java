package com.lambo.los.kits.digest;

import javax.crypto.*;
import javax.crypto.spec.IvParameterSpec;
import javax.crypto.spec.SecretKeySpec;
import java.security.InvalidAlgorithmParameterException;
import java.security.InvalidKeyException;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;

/**
 * aes加密工具类.
 * Created by lambo on 2017/7/26.
 */
final class AES {
    public static byte[] encrypt(byte[] content, byte[] keyBytes, byte[] iv) throws NoSuchAlgorithmException, NoSuchPaddingException, InvalidAlgorithmParameterException, InvalidKeyException, BadPaddingException, IllegalBlockSizeException {
        SecretKey key = new SecretKeySpec(keyBytes, "AES");
        if (keyBytes.length % 16 != 0) {
            KeyGenerator keyGenerator = KeyGenerator.getInstance("AES");
            keyGenerator.init(128, new SecureRandom(keyBytes));
            key = keyGenerator.generateKey();
        }
        Cipher cipher = Cipher.getInstance("AES/CBC/PKCS5Padding");
        cipher.init(Cipher.ENCRYPT_MODE, key, new IvParameterSpec(iv));
        return cipher.doFinal(content);
    }

    public static byte[] decrypt(byte[] content, byte[] keyBytes, byte[] iv) throws NoSuchAlgorithmException, NoSuchPaddingException, InvalidAlgorithmParameterException, InvalidKeyException, BadPaddingException, IllegalBlockSizeException {
        SecretKey key = new SecretKeySpec(keyBytes, "AES");
        if (keyBytes.length % 16 != 0) {
            KeyGenerator keyGenerator = KeyGenerator.getInstance("AES");//key长可设为128，192，256位，这里只能设为128
            keyGenerator.init(128, new SecureRandom(keyBytes));
            key = keyGenerator.generateKey();
        }
        Cipher cipher = Cipher.getInstance("AES/CBC/PKCS5Padding");
        cipher.init(Cipher.DECRYPT_MODE, key, new IvParameterSpec(iv));
        return cipher.doFinal(content);
    }
}
