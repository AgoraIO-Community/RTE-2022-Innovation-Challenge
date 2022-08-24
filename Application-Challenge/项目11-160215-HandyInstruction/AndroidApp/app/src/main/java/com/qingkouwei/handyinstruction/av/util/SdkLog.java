package com.qingkouwei.handyinstruction.av.util;

import java.util.HashMap;
import java.util.Map;

public class SdkLog {
	
	public static final int DEBUG = android.util.Log.DEBUG;
	public static final int INFO = android.util.Log.INFO;
	public static final int WARN = android.util.Log.WARN;
	public static final int ERROR = android.util.Log.ERROR;
	
	private static final String DEFAULT_TAG = "_TAG";
	private static final int DEFAULT_LEVEL = DEBUG;

	private static Map<String, Integer> levelMap = new HashMap<String, Integer>();
	static {
		levelMap.put(DEFAULT_TAG, DEFAULT_LEVEL);
	}

	private static LogDepend gLogDepend;
	public static SdkLog getLog(String tag) {
		return getLog(tag, DEFAULT_LEVEL);
	}

	public static void setLogDepend(LogDepend log){
		gLogDepend = log;
	}

	public static SdkLog getLog(String tag, int level) {
		if (tag == null || tag.isEmpty()) {
			tag = DEFAULT_TAG;
		}
		
		int l = level;
		if (levelMap.containsKey(tag)) {
			level = levelMap.get(tag);
		}
		
		return new SdkLog(tag, l);
	}

	private String tag;
	private int level;
	
	private SdkLog(String tag, int level) {
		this.tag = tag;
		this.level = level;
	}
	
	public void d(String message, Object...args) {
		if(gLogDepend != null){
			gLogDepend.d(tag, String.format(message, args));
			return;
		}
		if (level <= DEBUG) {
			android.util.Log.i(tag, String.format(message, args));
		}
	}
	
	public void d(String message, Throwable t) {
		if(gLogDepend != null){
			gLogDepend.d(tag, message + ":" + t);
			return;
		}
		if (level <= DEBUG) {
			android.util.Log.i(tag, message, t);
		}
	}

	public void i(String message, Object...args) {
		if(gLogDepend != null){
			gLogDepend.i(tag, String.format(message, args));
			return;
		}
		if (level <= INFO) {
			android.util.Log.i(tag, String.format(message, args));
		}
	}
	
	public void i(String message, Throwable t) {
		if(gLogDepend != null){
			gLogDepend.i(tag, message + ":" + t);
			return;
		}
		if (level <= INFO) {
			android.util.Log.i(tag, message, t);
		}
	}

	public void w(String message, Object...args) {
		if(gLogDepend != null){
			gLogDepend.w(tag, String.format(message, args));
			return;
		}
		if (level <= WARN) {
			android.util.Log.w(tag, String.format(message, args));
		}
	}
	
	public void w(String message, Throwable t) {
		if(gLogDepend != null){
			gLogDepend.w(tag, message + ":" + t);
			return;
		}
		if (level <= WARN) {
			android.util.Log.w(tag, message, t);
		}
	}

	public void e(String message, Object...args) {
		if(gLogDepend != null){
			gLogDepend.e(tag, String.format(message, args));
			return;
		}
		if (level <= ERROR) {
			android.util.Log.e(tag, String.format(message, args));
		}
	}
	
	public void e(String message, Throwable t) {
		if(gLogDepend != null){
			gLogDepend.e(tag, message + ":" + t);
			return;
		}
		if (level <= ERROR) {
			android.util.Log.e(tag, message, t);
		}
	}
	public interface LogDepend{
		void d(String tag, String message);
		void i(String tag, String message);
		void w(String tag, String message);
		void e(String tag, String message);
	}
}
