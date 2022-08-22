package agora;

public interface IFragmentCallback {
    void sendMsgToActivity(String string);
    String getMsgFromActivity(String msg);
}
