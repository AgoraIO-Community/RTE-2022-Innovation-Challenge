## 简介

使用bash 脚本方式测试rest api 识别接口

- windows 下需要安装 cygwin，在cygwin内安装curl


## 测试流程

### 修改token.sh

从网页中申请的应用获取appKey和appSecret

```bash
APPKEY="g8eBUMSokVB1BHGmgxxxxxx"
APPSECRET="94dc99566550d87f8fa8ece112xxxxx"
```

## 运行 asr.sh，进行识别
```bash
sh asr.sh
# 调试使用 sh -x asr.sh
```
有如下返回

```json
{"access_token":"24.03c7304a2ab08edc1589bb83cbe0de18.2592000.1522060569.282335-10455099","session_key":"9mzdCyse3JwGR1cK\/XAkMMXTp7D7mQ+9ulfLpycoWHOuZQBmQtPSE9MnAF6kUNqDnAgnaoyjP\/qkYgtciDo9PKgyozlbIw==","scope":"public audio_voice_assistant_get audio_tts_post wise_adapt lebo_resource_base lightservice_public hetu_basic lightcms_map_poi kaidian_kaidian ApsMisTest_Test\u6743\u9650 vis-classify_flower bnstest_fasf lpq_\u5f00\u653e cop_helloScope ApsMis_fangdi_permission","refresh_token":"25.f54659f694f686cf574f8723d48cbe4d.315360000.1834828569.282335-10455099","session_secret":"e730778e4d239a4811ba6424556ef701","expires_in":2592000}
```

- scope 含有audio_voice_assistant_get表示有语音识别能力，没有的话请至网页激活
- expires_in 表示 2592000秒后该token失效
- token  24.03c7304a2ab08edc1589bb83cbe0de18.2592000.1522060569.282335-10455099



最终结果如：

```json
{"corpus_no":"6526075710854540378","err_msg":"success.","err_no":0,"result":["北京科技馆，"],"sn":"402172223481519470408"}
```

### 测试其它音频文件



修改以下参数：

```bash
FILE="16k.pcm"

# 根据文件FILE的后缀填写：pcm/wav/amr/m4a 格式
FORMAT="pcm"
# 根据文档填写PID，1537 表示识别普通话，使用输入法模型。
DEV_PID="1537"
```



1. 如测试英语 修改为:

```bash
DEV_PID="1737"
```

2. 如测试采样率为16k 的amr文件16k-23850.amr，修改为：

```bash
FILE="16k-23850.amr"

# 根据文件FILE的后缀填写：pcm/wav/amr 格式，极速版额外支持m4a 格式
FORMAT="amr"
```


### 极速版本测试
打开下面2行的注释

```bash
# API_URL="https://vop.baidu.com/pro_api"
# DEV_PID="80001"
```
另外极速版在支持文件后缀 pcm/wav/amr/m4a文件 

### 测试自训练平台
自训练平台模型上线后，您会看见 第二步：“”获取专属模型参数pid:8001，modelid:1234”，按照这个信息获取 dev_pid=8001，lm_id=1234

需要打开以下注释：
```bash
# DEV_PID="8001"   
# LM_ID="1234"

# ASR_URL="${API_URL}?dev_pid=${DEV_PID}&lm_id={LM_ID}$&token=$token&cuid=123456"
