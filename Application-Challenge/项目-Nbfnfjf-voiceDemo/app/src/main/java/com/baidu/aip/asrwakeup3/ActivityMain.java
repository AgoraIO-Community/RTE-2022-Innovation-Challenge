package com.baidu.aip.asrwakeup3;

import com.baidu.aip.asrwakeup3.uiasr.activity.ActivityListMain;


/**
 * 这个Activity用于展示和调用AndroidManifest.xml里定义的其它Activity。本身没有业务逻辑。
 * 请在AndroidManifest.xml中定义 APP_ID APP_KEY APP_SECRET
 * <p>
 * ActivityOnlineRecog : 在线识别，用于展示在线情况下的识别参数和效果。
 * ActivityOffline：离线命令词识别。用于展示离线情况下，离线语法的参数和效果。并可以测试在线的去情况下，离线语法的参数并不启用。
 * ActivityNlu： 语义理解。 在识别出文字的情况下，百度语音在线服务端和本地SDK可以对这些识别出的文字做语义解析（即分词）。
 * 其中语音服务端做的语义解析必须在线。即语义解析的中文为在线识别成功后的结果。
 * 本地SDK做的语义解析，会覆盖服务端做的语义解析结果。语义解析的中文可以是在线识别成功后的结果，也可以是离线语法的识别结果
 * ActivityAllRecog ： 全部识别功能，涵盖前面三个acitivty的所有功能。
 * ActivityWakeUp： 唤醒词功能。 唤醒词指的是SDK收到某个关键词的声音后回调用户的代码，与Android 系统的锁屏唤醒无关。
 * <p>
 * AcitivityMiniRecog： 内含有调用SDK识别功能的最小代码。用于debug和反馈SDK问题。
 */
public class ActivityMain extends ActivityListMain {

}

