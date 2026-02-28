package com.lambo.los.kits;

/**
 * 简单的业务异常
 *
 * @author 林小宝
 * @createTime 2014年8月10日 上午1:01:48
 */
public class BizException extends RuntimeException {
    private static final long serialVersionUID = 6368601197928340154L;
    private int code = -1;
    private String extMsg;

    public BizException() {
        super();
    }

    public BizException(Throwable throwable) {
        super(throwable);
    }

    public BizException(String message, Throwable throwable) {
        super(message, throwable);
    }

    public BizException(int code, String message, Throwable throwable) {
        super(message, throwable);
        this.code = code;
    }

    public BizException(String message) {
        super(message);
    }

    public BizException(int code, String message) {
        super(message);
        this.code = code;
    }

    public BizException(int code, String message, String extMsg) {
        super(message);
        this.code = code;
        this.extMsg = extMsg;
    }

    public int getCode() {
        return code;
    }

    public String getExtMsg() {
        return extMsg;
    }
}
