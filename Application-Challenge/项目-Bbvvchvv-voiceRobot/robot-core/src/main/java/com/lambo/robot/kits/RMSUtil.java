package com.lambo.robot.kits;

/**
 * record.
 * Created by lambo on 2017/7/28.
 */
public class RMSUtil {

    /**
     * 查询音量.
     *
     * @param audioData 语音文件.
     * @return
     */
    public static double getRMS(byte[] audioData) {
        double sum = 0;
        for (int i = 0; i < audioData.length / 2; i++) {
            double sample = (audioData[i * 2] | audioData[i * 2 + 1] << 8) / 32768.0;
            sum += Math.abs(sample);
        }
        return 77.0 * Math.log10(Math.sqrt(sum / audioData.length / 2) / 65535.0);
    }


    /**
     * 根据输入的音量大小来判断用户是否有语音输入
     *
     * @param audioData 原始音频数据
     * @param sampleRate 音频数据格式位PCM，16位每个样本，比如如果音频数据格式设为AudioFormat.ENCODING_PCM_16BIT，则参数传16
     * @return >0 代表有音频输入
     */
    public static int calculateVolume(byte[] audioData, int sampleRate) {
        int[] var3 = null;
        int var4 = audioData.length;
        int var2;
        if (sampleRate == 8) {
            var3 = new int[var4];
            for (var2 = 0; var2 < var4; ++var2) {
                var3[var2] = audioData[var2];
            }
        } else if (sampleRate == 16) {
            var3 = new int[var4 / 2];
            for (var2 = 0; var2 < var4 / 2; ++var2) {
                byte var5 = audioData[var2 * 2];
                byte var6 = audioData[var2 * 2 + 1];
                int var13;
                if (var5 < 0) {
                    var13 = var5 + 256;
                } else {
                    var13 = var5;
                }
                short var7 = (short) (var13);
                if (var6 < 0) {
                    var13 = var6 + 256;
                } else {
                    var13 = var6;
                }
                var3[var2] = (short) (var7 + (var13 << 8));
            }
        }
        int[] var8 = var3;
        if (var3 != null && var3.length != 0) {
            float var10 = 0.0F;
            for (int aVar8 : var8) {
                var10 += (float) (aVar8 * aVar8);
            }
            var10 /= (float) var8.length;
            float var12 = 0.0F;
            for (var4 = 0; var4 < var8.length; ++var4) {
                var12 += (float) var8[var4];
            }
            var12 /= (float) var8.length;
            var4 = (int) (Math.pow(2.0D, (double) (sampleRate - 1)) - 1.0D);
            double var14 = Math.sqrt((double) (var10 - var12 * var12));
            int var9;
            if ((var9 = (int) (10.0D * Math.log10(var14 * 10.0D * Math.sqrt(2.0D) / (double) var4 + 1.0D))) < 0) {
                var9 = 0;
            }
            if (var9 > 10) {
                var9 = 10;
            }
            return var9;
        } else {
            return 0;
        }
    }
}
