package agora;

import java.math.BigInteger;
import java.util.ArrayList;

public class Han_encode {
    public static String stringToStr12(String a) {
        if(a.contains("-")){
            String[] strings=a.split("_");
            double d1=Double.parseDouble(strings[0]);
            double d2=Double.parseDouble(strings[1]);
            if(d1<0){
                d1=d1+180;
            }
            if(d2<0){
                d2=d2+360;
            }
            a=String.valueOf(d1)+"_"+String.valueOf(d2);
        }
        StringBuffer sb=new StringBuffer();
        for(int i=0;i<a.length();i++) {
            if(a.charAt(i)=='.') {
                sb.append('a');
            }else if(a.charAt(i)=='_') {
                sb.append('b');
            }else {
                sb.append(a.charAt(i));
            }
        }
        return sb.toString();
    }
    public static String str12ToString(String a) {
        StringBuffer sb=new StringBuffer();
        for(int i=0;i<a.length();i++) {
            if(a.charAt(i)=='a') {
                sb.append('.');
            }else if(a.charAt(i)=='b') {
                sb.append('_');
            }else {
                sb.append(a.charAt(i));
            }
        }
        String str=sb.toString();
        String XiuFuBug=str;
            String[] strings=str.split("_");
            if(strings.length==2) {
                double d1 = Double.parseDouble(strings[0]);
                double d2 = Double.parseDouble(strings[1]);
                if (d1 > 90) {
                    d1 = d1 - 180;
                    XiuFuBug = String.valueOf(d1) + "_" + String.valueOf(d2);
                }
                if (d2 > 180) {
                    d2 = d2 - 360;
                    XiuFuBug = String.valueOf(d1) + "_" + String.valueOf(d2);
                }
            }


        return XiuFuBug;
    }
    public static String decode(int[] jieGuo) {
        BigInteger bigInt12=new BigInteger("1");
        BigInteger result=new BigInteger("0");
        for(int i=0;i<=jieGuo.length-1;i++) {
            if(i!=0) {
                bigInt12=bigInt12.multiply(new BigInteger("3200"));
            }
            result=result.add(bigInt12.multiply(new BigInteger(String.valueOf(jieGuo[i]-9))));
        }
        StringBuilder sb=new StringBuilder();
        BigInteger jinZhiBig10=new BigInteger("10");
        BigInteger jinZhiBig11=new BigInteger("11");
        BigInteger jinZhiBig12=new BigInteger("12");
        BigInteger duiBiLing=new BigInteger("0");
        BigInteger rest=new BigInteger("1");
        rest=result;
        while(rest.equals(duiBiLing)==false) {
            BigInteger[] resBigIntegers = rest.divideAndRemainder(jinZhiBig12);//除以12
            if(resBigIntegers[1].equals(jinZhiBig10))
                sb.append("a");
            else if(resBigIntegers[1].equals(jinZhiBig11))
                sb.append("b");
            else {
                sb.append(resBigIntegers[1].toString());
            }
            rest=resBigIntegers[0];
        }
        return sb.reverse().toString();

    }
    public static int[] encode(String str1) {
        ArrayList<Integer> arrayList=new ArrayList<Integer>(20);
        String str2=new StringBuilder(str1).reverse().toString();
        String str3="";
        BigInteger bigInt12=new BigInteger("1");
        BigInteger result=new BigInteger("0");
        BigInteger rest=new BigInteger("1");
        for(int i=0;i<str2.length();i++) {
            if(i!=0) {
                bigInt12=bigInt12.multiply(new BigInteger("12"));
            }
            if(str2.charAt(i)=='a') {
                str3="10";
                result=result.add(bigInt12.multiply(new BigInteger(str3)));
            }
            else if(str2.charAt(i)=='b') {
                str3="11";
                result=result.add(bigInt12.multiply(new BigInteger(str3)));
            }
            else {
                result=result.add(bigInt12.multiply(new BigInteger(String.valueOf(str2.charAt(i)))));
            }

        }
        BigInteger jinZhiBig=new BigInteger("3200");
        BigInteger duiBiLing=new BigInteger("0");
        rest=result;
        while(rest.equals(duiBiLing)==false) {
            BigInteger[] resBigIntegers = rest.divideAndRemainder(jinZhiBig);
            arrayList.add(resBigIntegers[1].intValue());
            rest=resBigIntegers[0];
        }
        int[] jieGuo=new int[arrayList.size()];
        for(int i=0;i<arrayList.size();i++) {
            jieGuo[i]=arrayList.get(i).intValue()+9;
        }

        BigInteger bigInt122=new BigInteger("1");
        BigInteger result2=new BigInteger("0");
        for(int i=0;i<=jieGuo.length-1;i++) {
            if(i!=0) {
                bigInt122=bigInt122.multiply(new BigInteger("3200"));
            }
            result2=result2.add(bigInt122.multiply(new BigInteger(String.valueOf(jieGuo[i]))));
        }
        return jieGuo;

    }
}
