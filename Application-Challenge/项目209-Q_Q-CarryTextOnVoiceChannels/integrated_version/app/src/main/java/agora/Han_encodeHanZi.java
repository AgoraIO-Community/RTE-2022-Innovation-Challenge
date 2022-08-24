package agora;

import java.util.ArrayList;

public class Han_encodeHanZi {
	public static String decode(int[] jieGuo) {
		for(int i=0;i<jieGuo.length;i++) {
			jieGuo[i]=jieGuo[i]-9;
		}
		StringBuffer sb=new StringBuffer();
		for(int i=0;i<jieGuo.length;i++) {
			if(i==jieGuo.length-1) {
				sb.append((char)jieGuo[i]);
			}else if(jieGuo[i+1]<31) {
				sb.append((char)(jieGuo[i]+3200*jieGuo[i+1]));
				i++;
			}else {
				sb.append((char)jieGuo[i]);
			}
		}
		return sb.toString();
		
	}
	public static int[] encode(String str1) {
		ArrayList<Integer> arrayList=new ArrayList<Integer>(20);
		for(int i=0;i<str1.length();i++) {
			int c=(int)str1.charAt(i);
			int rest=c;
			while(rest!=0) {
				arrayList.add(rest%3200);
				rest=rest/3200;
			}
			System.out.print(c+",");
		}
		int[] jieGuo=new int[arrayList.size()];
		for(int i=0;i<arrayList.size();i++) {
			jieGuo[i]=arrayList.get(i)+9;
		}
		return jieGuo;
		
	}
}
