package agora;

public class Qiu_byte2Short {

    public static void toShortArrayReverse(byte[] src,short[] dest) {

        int count = src.length >> 1;
        for (int i = 0; i < count; i++) {
            dest[i] = (short) (src[i * 2+1] << 8 | src[2 * i] & 0xff);
        }
        return ;
    }
    public static void toByteArrayReverse(short[] src,byte[] dest) {

        int count = src.length;
        //byte[] dest = new byte[count << 1];
        for (int i = 0; i < count; i++) {
            dest[i * 2+1] = (byte) (src[i] >> 8);
            dest[i * 2 ] = (byte) (src[i] >> 0);
        }
        return ;
    }

    public static short[] toShortArray(byte[] src) {

        int count = src.length >> 1;
        short[] dest = new short[count];
        for (int i = 0; i < count; i++) {
            dest[i] = (short) (src[i * 2] << 8 | src[2 * i + 1] & 0xff);
        }
        return dest;
    }

    public static byte[] toByteArray(short[] src) {

        int count = src.length;
        byte[] dest = new byte[count << 1];
        for (int i = 0; i < count; i++) {
            dest[i * 2] = (byte) (src[i] >> 8);
            dest[i * 2 + 1] = (byte) (src[i] >> 0);
        }

        return dest;
    }

    public static int dataMax(double data[]){
        int index=0;
        double temp=data[0];
        for(int i=1;i<data.length;i++){
            if(data[i]>temp){
                temp=data[i];
                index=i;
            }
        }
        return index;
    }

}
