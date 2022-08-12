package com.qingkouwei.handyinstruction.av.bean;

public class Size {
	public int width;
	public int height;

	public Size() {
		width = 0;
		height = 0;
	}

	public Size(Size size) {
		this.width = size.width;
		this.height = size.height;
	}
	
	public Size(int width, int height) {
		this.width = width;
		this.height = height;
	}
	public static Size convertResolutionFormat(String resolution , Size defaultSize) {
		try {
			String[] arrays = resolution.split("\\*");
			return new Size(Integer.parseInt(arrays[0]),
					Integer.parseInt(arrays[1]));
		} catch (Exception e) {
			return defaultSize;
		}
	}
}
