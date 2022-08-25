//
//  AutomaticSpeechRecognitionViewController.m
//  VoiceBroadcast
//
//  Created by mac on 2019/4/15.
//  Copyright © 2019年 mac. All rights reserved.
// 语音识别

#import "AutomaticSpeechRecognitionViewController.h"
#import "fcntl.h"


@interface AutomaticSpeechRecognitionViewController ()<UITextViewDelegate,BDSClientASRDelegate,BDSClientWakeupDelegate,BDRecognizerViewDelegate,UIActionSheetDelegate>

@property (strong, nonatomic) BDSEventManager *asrEventManager;
@property (strong, nonatomic) BDSEventManager *wakeupEventManager;

@property (nonatomic,strong) UITextView *ResultTextView;
@property (nonatomic,strong) UITextView *logTextView;

@property (nonatomic,strong) UIButton *voiceRecogButton;
@property (nonatomic,strong) UIButton *cancelButton;
@property (nonatomic,strong) UIButton *finishButton;

@property(nonatomic, assign) BOOL continueToVR;
@property(nonatomic, strong) NSFileHandle *fileHandler;
@property(nonatomic, strong) BDRecognizerViewController *recognizerViewController;//语音识别视图控制类
@property(nonatomic, assign) TBDVoiceRecognitionOfflineEngineType curOfflineEngineType;


@property(nonatomic,assign) BOOL longPressFlag;
@property(nonatomic,assign) BOOL touchUpFlag;
@property(nonatomic,strong) NSTimer *longPressTimer;

@property(nonatomic, assign) BOOL longSpeechFlag;

@end

@implementation AutomaticSpeechRecognitionViewController

- (void)viewDidLoad {
    [super viewDidLoad];
    self.view.backgroundColor = [UIColor whiteColor];
    
    //初始化
    self.asrEventManager = [BDSEventManager createEventManagerWithName:BDS_ASR_NAME];
    self.wakeupEventManager = [BDSEventManager createEventManagerWithName:BDS_WAKEUP_NAME];
    
    NSLog(@"Current SDK version: %@", [self.asrEventManager libver]);
    
    self.continueToVR = NO;
    
    UIButton* backButton = [UIButton buttonWithType:UIButtonTypeCustom];
    backButton.frame = CGRectMake(10, 55, 100, 20);
    [backButton setTitle:@"返回首页" forState:UIControlStateNormal];
    [backButton setTitleColor:[UIColor grayColor] forState:UIControlStateNormal];
    backButton.titleLabel.font = [UIFont systemFontOfSize:15.0];
    [backButton setImageEdgeInsets:UIEdgeInsetsMake(0, -10, 0, 0)];
    [backButton setContentEdgeInsets:UIEdgeInsetsMake(0, 0, 0, 20)];
    [backButton addTarget:self action:@selector(returnBack:) forControlEvents:UIControlEventTouchUpInside];
    [self.view addSubview:backButton];
    
    [self configVoiceRecognitionClient];
    
    [self setASRUI];
    // Do any additional setup after loading the view.
}
- (void)viewDidAppear:(BOOL)animated
{
    [super viewDidAppear:animated];
//    self.curOfflineEngineType = (TBDVoiceRecognitionOfflineEngineType)[[[BDVRSettings getInstance] getCurrentValueForKey:(NSString *)BDS_ASR_OFFLINE_ENGINE_TYPE] integerValue];
}

#pragma mark - MVoiceRecognitionClientDelegate

- (void)VoiceRecognitionClientWorkStatus:(int)workStatus obj:(id)aObj {
    switch (workStatus) {
        case EVoiceRecognitionClientWorkStatusNewRecordData: {
            [self.fileHandler writeData:(NSData *)aObj];
            break;
        }
            
        case EVoiceRecognitionClientWorkStatusStartWorkIng: {
            NSDictionary *logDic = [self parseLogToDic:aObj];
            [self printLogTextView:[NSString stringWithFormat:@"CALLBACK: start vr, log: %@\n", logDic]];
            [self onStartWorking];
            break;
        }
        case EVoiceRecognitionClientWorkStatusStart: {
            [self printLogTextView:@"CALLBACK: detect voice start point.\n"];
            break;
        }
        case EVoiceRecognitionClientWorkStatusEnd: {
            [self printLogTextView:@"CALLBACK: detect voice end point.\n"];
            break;
        }
        case EVoiceRecognitionClientWorkStatusFlushData: {
            [self printLogTextView:[NSString stringWithFormat:@"CALLBACK: partial result - %@.\n\n", [self getDescriptionForDic:aObj]]];
            break;
        }
        case EVoiceRecognitionClientWorkStatusFinish: {
            [self printLogTextView:[NSString stringWithFormat:@"CALLBACK: final result - %@.\n\n", [self getDescriptionForDic:aObj]]];
            if (aObj) {
                self.ResultTextView.text = [self getDescriptionForDic:aObj];
            }
            if (!self.longSpeechFlag) {
                [self onEnd];
            }
            break;
        }
        case EVoiceRecognitionClientWorkStatusMeterLevel: {
            break;
        }
        case EVoiceRecognitionClientWorkStatusCancel: {
            [self printLogTextView:@"CALLBACK: user press cancel.\n"];
            [self onEnd];
            break;
        }
        case EVoiceRecognitionClientWorkStatusError: {
            [self printLogTextView:[NSString stringWithFormat:@"CALLBACK: encount error - %@.\n", (NSError *)aObj]];
            [self onEnd];
            break;
        }
        case EVoiceRecognitionClientWorkStatusLoaded: {
            [self printLogTextView:@"CALLBACK: offline engine loaded.\n"];
            break;
        }
        case EVoiceRecognitionClientWorkStatusUnLoaded: {
            [self printLogTextView:@"CALLBACK: offline engine unLoaded.\n"];
            break;
        }
        case EVoiceRecognitionClientWorkStatusChunkThirdData: {
            [self printLogTextView:[NSString stringWithFormat:@"CALLBACK: Chunk 3-party data length: %lu\n", (unsigned long)[(NSData *)aObj length]]];
            break;
        }
        case EVoiceRecognitionClientWorkStatusChunkNlu: {
            NSString *nlu = [[NSString alloc] initWithData:(NSData *)aObj encoding:NSUTF8StringEncoding];
            [self printLogTextView:[NSString stringWithFormat:@"CALLBACK: Chunk NLU data: %@\n", nlu]];
            NSLog(@"%@", nlu);
            break;
        }
        case EVoiceRecognitionClientWorkStatusChunkEnd: {
            [self printLogTextView:[NSString stringWithFormat:@"CALLBACK: Chunk end, sn: %@.\n", aObj]];
            if (!self.longSpeechFlag) {
                [self onEnd];
            }
            break;
        }
        case EVoiceRecognitionClientWorkStatusFeedback: {
            NSDictionary *logDic = [self parseLogToDic:aObj];
            [self printLogTextView:[NSString stringWithFormat:@"CALLBACK Feedback: %@\n", logDic]];
            break;
        }
        case EVoiceRecognitionClientWorkStatusRecorderEnd: {
            [self printLogTextView:@"CALLBACK: recorder closed.\n"];
            break;
        }
        case EVoiceRecognitionClientWorkStatusLongSpeechEnd: {
            [self printLogTextView:@"CALLBACK: Long Speech end.\n"];
            [self onEnd];
            break;
        }
        default:
            break;
    }
}

- (void)WakeupClientWorkStatus:(int)workStatus obj:(id)aObj
{
    switch (workStatus) {
        case EWakeupEngineWorkStatusStarted: {
            [self printLogTextView:@"WAKEUP CALLBACK: Started.\n"];
            break;
        }
        case EWakeupEngineWorkStatusStopped: {
            [self printLogTextView:@"WAKEUP CALLBACK: Stopped.\n"];
            break;
        }
        case EWakeupEngineWorkStatusLoaded: {
            [self printLogTextView:@"WAKEUP CALLBACK: Loaded.\n"];
            break;
        }
        case EWakeupEngineWorkStatusUnLoaded: {
            [self printLogTextView:@"WAKEUP CALLBACK: UnLoaded.\n"];
            break;
        }
        case EWakeupEngineWorkStatusTriggered: {
            [self printLogTextView:[NSString stringWithFormat:@"WAKEUP CALLBACK: Triggered - %@.\n", (NSString *)aObj]];
            if (self.continueToVR) {
                self.continueToVR = NO;
                [self.asrEventManager setParameter:@(YES) forKey:BDS_ASR_NEED_CACHE_AUDIO];
                [self.asrEventManager setParameter:aObj forKey:BDS_ASR_OFFLINE_ENGINE_TRIGGERED_WAKEUP_WORD];
                [self voiceRecogButtonHelper];
            }
            break;
        }
        case EWakeupEngineWorkStatusError: {
            [self printLogTextView:[NSString stringWithFormat:@"WAKEUP CALLBACK: encount error - %@.\n", (NSError *)aObj]];
            break;
        }
            
        default:
            break;
    }
}

- (void)printLogTextView:(NSString *)logString
{
//    self.logTextView.text = [logString stringByAppendingString:_logTextView.text];
//    [self.logTextView scrollRangeToVisible:NSMakeRange(0, 0)];
}

- (NSDictionary *)parseLogToDic:(NSString *)logString
{
    NSArray *tmp = NULL;
    NSMutableDictionary *logDic = [[NSMutableDictionary alloc] initWithCapacity:3];
    NSArray *items = [logString componentsSeparatedByString:@"&"];
    for (NSString *item in items) {
        tmp = [item componentsSeparatedByString:@"="];
        if (tmp.count == 2) {
            [logDic setObject:tmp.lastObject forKey:tmp.firstObject];
        }
    }
    return logDic;
}
#pragma mark - BDRecognizerViewDelegate
- (void)onRecordDataArrived:(NSData *)recordData sampleRate:(int)sampleRate
{
    [self.fileHandler writeData:(NSData *)recordData];
}
- (void)onEndWithViews:(BDRecognizerViewController *)aBDRecognizerViewController withResult:(id)aResult
{
    if (aResult) {
        self.ResultTextView.text = [self getDescriptionForDic:aResult];
    }
    [self.asrEventManager setDelegate:self];
}

#pragma mark - Private: Configuration
- (void)configVoiceRecognitionClient {
    //设置DEBUG_LOG的级别
    [self.asrEventManager setParameter:@(EVRDebugLogLevelTrace) forKey:BDS_ASR_DEBUG_LOG_LEVEL];
    //配置API_KEY 和 SECRET_KEY 和 APP_ID
    [self.asrEventManager setParameter:@[Voice_API_KEY, Voice_SECRET_KEY] forKey:BDS_ASR_API_SECRET_KEYS];
    [self.asrEventManager setParameter:Voice_APPID forKey:BDS_ASR_OFFLINE_APP_CODE];
    //配置端点检测（二选一）
    [self configModelVAD];
    //      [self configDNNMFE];
    
    //     [self.asrEventManager setParameter:@"15361" forKey:BDS_ASR_PRODUCT_ID];
    // ---- 语义与标点 -----
    [self enableNLU];
    //    [self enablePunctuation];
    // ------------------------
}


- (void) enableNLU {
    // ---- 开启语义理解 -----
    [self.asrEventManager setParameter:@(YES) forKey:BDS_ASR_ENABLE_NLU];
    [self.asrEventManager setParameter:@"1536" forKey:BDS_ASR_PRODUCT_ID];
}

- (void) enablePunctuation {
    // ---- 开启标点输出 -----
    [self.asrEventManager setParameter:@(NO) forKey:BDS_ASR_DISABLE_PUNCTUATION];
    // 普通话标点
    //    [self.asrEventManager setParameter:@"1537" forKey:BDS_ASR_PRODUCT_ID];
    // 英文标点
    [self.asrEventManager setParameter:@"1737" forKey:BDS_ASR_PRODUCT_ID];
    
}
- (void)configModelVAD {
    NSString *modelVAD_filepath = [[NSBundle mainBundle] pathForResource:@"bds_easr_basic_model" ofType:@"dat"];
    [self.asrEventManager setParameter:modelVAD_filepath forKey:BDS_ASR_MODEL_VAD_DAT_FILE];
    [self.asrEventManager setParameter:@(YES) forKey:BDS_ASR_ENABLE_MODEL_VAD];
}

- (void)configDNNMFE {
    NSString *mfe_dnn_filepath = [[NSBundle mainBundle] pathForResource:@"bds_easr_mfe_dnn" ofType:@"dat"];
    [self.asrEventManager setParameter:mfe_dnn_filepath forKey:BDS_ASR_MFE_DNN_DAT_FILE];
    NSString *cmvn_dnn_filepath = [[NSBundle mainBundle] pathForResource:@"bds_easr_mfe_cmvn" ofType:@"dat"];
    [self.asrEventManager setParameter:cmvn_dnn_filepath forKey:BDS_ASR_MFE_CMVN_DAT_FILE];
    
    [self.asrEventManager setParameter:@(NO) forKey:BDS_ASR_ENABLE_MODEL_VAD];
    // MFE支持自定义静音时长
    //    [self.asrEventManager setParameter:@(500.f) forKey:BDS_ASR_MFE_MAX_SPEECH_PAUSE];
    //    [self.asrEventManager setParameter:@(500.f) forKey:BDS_ASR_MFE_MAX_WAIT_DURATION];
}

#pragma mark -- 点击语音识别
- (void)voiceButtonTouchDown:(UIButton *)sender{
    self.touchUpFlag = NO;
    self.longPressFlag = NO;
    self.longPressTimer = [NSTimer timerWithTimeInterval:0.5
                                                  target:self
                                                selector:@selector(longPressTimerTriggered) userInfo:nil repeats:NO];
    [[NSRunLoop currentRunLoop] addTimer:self.longPressTimer forMode:NSRunLoopCommonModes];
    
    [self cleanLogUI];
    [self.asrEventManager setParameter:@(NO) forKey:BDS_ASR_ENABLE_LONG_SPEECH];
    [self.asrEventManager setParameter:@(NO) forKey:BDS_ASR_NEED_CACHE_AUDIO];
    [self.asrEventManager setParameter:@"" forKey:BDS_ASR_OFFLINE_ENGINE_TRIGGERED_WAKEUP_WORD];
    [self voiceRecogButtonHelper];
}

- (void)longPressTimerTriggered
{
    if (!self.touchUpFlag) {
        self.longPressFlag = YES;
        [self.asrEventManager setParameter:@(YES) forKey:BDS_ASR_VAD_ENABLE_LONG_PRESS];
    }
    [self.longPressTimer invalidate];
}

- (void)voiceButtonTouchUpInside:(UIButton *)sender{
    self.touchUpFlag = YES;
    if (self.longPressFlag) {
        [self.asrEventManager sendCommand:BDS_ASR_CMD_STOP];
    }
}

#pragma mark - UI Button Helper
- (void)cleanLogUI
{
    self.ResultTextView.text = @"";
}
- (void)onInitializing
{
    self.voiceRecogButton.enabled = NO;
//    [self.voiceRecogButton setTitle:@"Initializing..." forState:UIControlStateNormal];
    [self.voiceRecogButton setTitle:@"初始化中..." forState:UIControlStateNormal];
}
- (void)onStartWorking
{
    self.finishButton.enabled = YES;
    self.cancelButton.enabled = YES;
//    [self.voiceRecogButton setTitle:@"Speaking..." forState:UIControlStateNormal];
    [self.voiceRecogButton setTitle:@"请讲话..." forState:UIControlStateNormal];
}

- (void)onEnd
{
    self.longSpeechFlag = NO;
    self.finishButton.enabled = NO;
    self.cancelButton.enabled = NO;
    self.voiceRecogButton.enabled = YES;
    [self.voiceRecogButton setTitle:@"语音识别" forState:UIControlStateNormal];
}
- (void)voiceRecogButtonHelper
{
    //    [self configFileHandler];
    [self.asrEventManager setDelegate:self];
    [self.asrEventManager setParameter:nil forKey:BDS_ASR_AUDIO_FILE_PATH];
    [self.asrEventManager setParameter:nil forKey:BDS_ASR_AUDIO_INPUT_STREAM];
    [self.asrEventManager sendCommand:BDS_ASR_CMD_START];
    [self onInitializing];
}

#pragma mark -- UI
- (void)setASRUI{
    UILabel *lable = [[UILabel alloc]init];
    lable.text = @"识别结果：";
    lable.textColor = [UIColor grayColor];
    [self.view addSubview:lable];
    [lable mas_makeConstraints:^(MASConstraintMaker *make) {
        make.left.mas_equalTo(self.view.mas_left).offset(11);
        make.top.mas_equalTo(self.view.mas_top).offset(100);
        make.right.mas_equalTo(self.view.mas_right).offset(-11);
        make.height.mas_equalTo(20);
    }];
    
    _ResultTextView = [[UITextView alloc]init];
    _ResultTextView.textColor = [UIColor blackColor];
    _ResultTextView.font = [UIFont systemFontOfSize:16];
    _ResultTextView.delegate = self;
    _ResultTextView.returnKeyType = UIReturnKeyDone;
    _ResultTextView.backgroundColor = [UIColor grayColor];
    [self.view addSubview:_ResultTextView];
    [_ResultTextView mas_makeConstraints:^(MASConstraintMaker *make) {
        make.left.mas_equalTo(lable.mas_left);
        make.top.mas_equalTo(lable.mas_bottom).offset(10);
        make.right.mas_equalTo(self.view.mas_right).offset(-11);
        make.height.mas_equalTo(BOUNDS.size.width/2);
    }];
    
    
//结束、语音识别、取消
    _finishButton = [[UIButton alloc]init];
    [_finishButton setTitle:@"结束" forState:UIControlStateNormal];
    [_finishButton setTitleColor:[UIColor grayColor] forState:UIControlStateNormal];
    _finishButton.titleLabel.font = [UIFont systemFontOfSize:15];
    [_finishButton addTarget:self action:@selector(finishButtonAction:) forControlEvents:UIControlEventTouchUpInside];
    [self.view addSubview:_finishButton];
    [_finishButton mas_makeConstraints:^(MASConstraintMaker *make) {
        make.left.mas_equalTo(self.view.mas_left).offset(20);
        make.top.mas_equalTo(self.ResultTextView.mas_bottom).offset(60);
        make.width.mas_equalTo(80);
        make.height.mas_equalTo(30);
    }];
    
    _voiceRecogButton = [[UIButton alloc]init];
    [_voiceRecogButton setTitle:@"语音识别" forState:UIControlStateNormal];
    [_voiceRecogButton setTitleColor:[UIColor grayColor] forState:UIControlStateNormal];
    _voiceRecogButton.titleLabel.font = [UIFont systemFontOfSize:15];
    [_voiceRecogButton addTarget:self action:@selector(voiceButtonTouchDown:) forControlEvents:UIControlEventTouchDown];
    [_voiceRecogButton addTarget:self action:@selector(voiceButtonTouchUpInside:) forControlEvents:UIControlEventTouchUpInside];
    [self.view addSubview:_voiceRecogButton];
    [_voiceRecogButton mas_makeConstraints:^(MASConstraintMaker *make) {
        make.centerX.mas_equalTo(self.view.mas_centerX);
        make.top.mas_equalTo(self.ResultTextView.mas_bottom).offset(60);
        make.width.mas_equalTo(120);
        make.height.mas_equalTo(30);
    }];
    
    _cancelButton = [[UIButton alloc]init];
    [_cancelButton setTitle:@"取消" forState:UIControlStateNormal];
    [_cancelButton setTitleColor:[UIColor grayColor] forState:UIControlStateNormal];
    _cancelButton.titleLabel.font = [UIFont systemFontOfSize:15];
    [_cancelButton addTarget:self action:@selector(cancelButtonAction:) forControlEvents:UIControlEventTouchUpInside];
    [self.view addSubview:_cancelButton];
    [_cancelButton mas_makeConstraints:^(MASConstraintMaker *make) {
        make.right.mas_equalTo(self.view.mas_right).offset(-20);
        make.top.mas_equalTo(self.ResultTextView.mas_bottom).offset(60);
        make.width.mas_equalTo(80);
        make.height.mas_equalTo(30);
    }];
    
    //日志输出
//    _logTextView = [[UITextView alloc]init];
//    _logTextView.textColor = [UIColor blackColor];
//    _logTextView.font = [UIFont systemFontOfSize:16];
//    _logTextView.delegate = self;
//    _logTextView.returnKeyType = UIReturnKeyDone;
//    _logTextView.backgroundColor = [UIColor grayColor];
//    [self.view addSubview:_logTextView];
//    [_logTextView mas_makeConstraints:^(MASConstraintMaker *make) {
//        make.left.mas_equalTo(self.view.mas_left).offset(11);
//        make.right.mas_equalTo(self.view.mas_right).offset(-11);
//        make.top.mas_equalTo(self.voiceRecogButton.mas_bottom).offset(10);
//        make.height.mas_equalTo(BOUNDS.size.height/3);
//    }];
}

//结束
- (void)finishButtonAction:(UIButton *)sender{
    self.finishButton.enabled = NO;
    [self.asrEventManager sendCommand:BDS_ASR_CMD_STOP];
}
//取消
- (void)cancelButtonAction:(UIButton *)sender{
    self.finishButton.enabled = NO;
    self.cancelButton.enabled = NO;
    [self.asrEventManager sendCommand:BDS_ASR_CMD_CANCEL];
}

//返回
- (void)returnBack:(UIButton *)sender{
    [self dismissViewControllerAnimated:YES completion:nil];
}

#pragma mark -- UITextView Return响应键盘
-(BOOL)textView:(UITextView *)textView shouldChangeTextInRange:(NSRange)range replacementText:(NSString *)text
{
    if ([text isEqualToString:@"\n"]) {
        [textView resignFirstResponder];
        return NO;
    }
    return YES;
}

#pragma mark - Private: File

- (NSString *)getFilePath:(NSString *)fileName {
    NSArray *paths = NSSearchPathForDirectoriesInDomains(NSDocumentDirectory, NSUserDomainMask, YES);
    if (paths && [paths count]) {
        return [[paths objectAtIndex:0] stringByAppendingPathComponent:fileName];
    } else {
        return nil;
    }
}

- (NSFileHandle *)createFileHandleWithName:(NSString *)aFileName isAppend:(BOOL)isAppend {
    NSFileHandle *fileHandle = nil;
    NSString *fileName = [self getFilePath:aFileName];
    
    int fd = -1;
    if (fileName) {
        if ([[NSFileManager defaultManager] fileExistsAtPath:fileName]&& !isAppend) {
            [[NSFileManager defaultManager] removeItemAtPath:fileName error:nil];
        }
        
        int flags = O_WRONLY | O_APPEND | O_CREAT;
        fd = open([fileName fileSystemRepresentation], flags, 0644);
    }
    
    if (fd != -1) {
        fileHandle = [[NSFileHandle alloc] initWithFileDescriptor:fd closeOnDealloc:YES];
    }
    
    return fileHandle;
}


- (NSString *)getDescriptionForDic:(NSDictionary *)dic {
    if (dic) {
        return [[NSString alloc] initWithData:[NSJSONSerialization dataWithJSONObject:dic
                                                                              options:NSJSONWritingPrettyPrinted
                                                                                error:nil] encoding:NSUTF8StringEncoding];
    }
    return nil;
}

@end
