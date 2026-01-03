//
//  ViewController.m
//  播报语音
//
//  Created by mac on 2019/4/15.
//  Copyright © 2019年 mac. All rights reserved.
//

#import "ViewController.h"
#import "AutomaticSpeechRecognitionViewController.h"//语音识别


#import <AVFoundation/AVSpeechSynthesis.h>

@interface ViewController ()<AVSpeechSynthesizerDelegate>

@property (nonatomic,strong) AVSpeechSynthesizer *synth;

@end

@implementation ViewController

- (void)viewDidLoad {
    [super viewDidLoad];
    
    [self setUI];
    // Do any additional setup after loading the view, typically from a nib.
}

#pragma mark -- UI
- (void)setUI{
    UIButton *startButton = [UIButton buttonWithType:UIButtonTypeCustom];
    startButton.frame = CGRectMake(100,100,100,50);
    [startButton setTitle:@"开始朗读"forState:UIControlStateNormal];
    [startButton setTitleColor:[UIColor blueColor] forState:UIControlStateNormal];
    startButton.backgroundColor = [UIColor grayColor];
    startButton.showsTouchWhenHighlighted = YES;
    [startButton addTarget:self action:@selector(speakText:) forControlEvents:UIControlEventTouchUpInside];
    [self.view addSubview:startButton];
    
    UIButton *stopButton = [UIButton buttonWithType:UIButtonTypeCustom];
    stopButton.frame = CGRectMake(100,200,100,50);
    [stopButton setTitle:@"停止朗读"forState:UIControlStateNormal];
    [stopButton setTitleColor:[UIColor blueColor] forState:UIControlStateNormal];
    stopButton.backgroundColor = [UIColor grayColor];
    stopButton.showsTouchWhenHighlighted = YES;
    [stopButton addTarget:self action:@selector(stopSpeakText:) forControlEvents:UIControlEventTouchUpInside];
    [self.view addSubview:stopButton];
    
    UIButton *ASRButton = [UIButton buttonWithType:UIButtonTypeCustom];
    ASRButton.frame = CGRectMake(100,300,100,50);
    [ASRButton setTitle:@"语音识别"forState:UIControlStateNormal];
    [ASRButton setTitleColor:[UIColor blueColor] forState:UIControlStateNormal];
    ASRButton.backgroundColor = [UIColor grayColor];
    ASRButton.showsTouchWhenHighlighted = YES;
    [ASRButton addTarget:self action:@selector(ASRText:) forControlEvents:UIControlEventTouchUpInside];
    [self.view addSubview:ASRButton];
}


#pragma Mark--Action
- (void)ASRText:(UIButton *)sender{
    AutomaticSpeechRecognitionViewController *asrView = [[AutomaticSpeechRecognitionViewController alloc]init];
    UINavigationController *navigation = [[UINavigationController alloc]initWithRootViewController:asrView];
    navigation.navigationBarHidden = true;
    [self presentViewController:navigation animated:YES completion:nil];
}
//语音播报与暂停
- (void)stopSpeakText:(UIButton *)sender{
    [_synth stopSpeakingAtBoundary:AVSpeechBoundaryWord];//停止播放，调用这个方法，再开始时会从头开始重新朗读
    
    //[synth pauseSpeakingAtBoundary:AVSpeechBoundaryWord];//暂停播放，调用这个方法，再开始时会从暂停的地方继续播放
}

- (void)speakText:(UIButton *)sender{
    if( [[[UIDevice currentDevice] systemVersion] integerValue] >= 7.0)  // 判断系统是否大于或等于 7.0
    {
        if ([_synth isPaused]) {
            //如果暂停则恢复，会从暂停的地方继续
            [_synth continueSpeaking];
        } else {
           //需要转换的文字
        NSString *str = @"一个是阆苑仙葩，一个是美玉无瑕。若说没奇缘，今生偏又遇着他；若说有奇缘，如何心事终虚化？一个枉自嗟呀，一个空劳牵挂。一个是水中月，一个是镜中花。想眼中能有多少泪珠儿，怎禁得秋流到冬尽，春流到夏！";
            AVSpeechUtterance *utterance = [AVSpeechUtterance speechUtteranceWithString:str];
            utterance.rate = 0.5; // 设置语速，范围0-1，注意0最慢，1最快；（AVSpeechUtteranceMinimumSpeechRate最慢，AVSpeechUtteranceMaximumSpeechRate最快）
            _synth = [[AVSpeechSynthesizer alloc] init];
            _synth.delegate = self;//设置代理
            //获取当前系统语音
            NSString *preferredLang = @"";
            //设置发音，这是中文普通话
            preferredLang = @"zh-CN";
            AVSpeechSynthesisVoice *voice = [AVSpeechSynthesisVoice voiceWithLanguage:[NSString stringWithFormat:@"%@",preferredLang]];
            utterance.voice = voice;
            [_synth speakUtterance:utterance]; // 开始朗读
            
        }
    }
    
}

#pragma mark --- 下面是代理方法： AVSpeechSynthesizerDelegate
- (void)speechSynthesizer:(AVSpeechSynthesizer*)synthesizer didStartSpeechUtterance:(AVSpeechUtterance*)utterance{
    NSLog(@"---开始播放");
}

- (void)speechSynthesizer:(AVSpeechSynthesizer*)synthesizer didFinishSpeechUtterance:(AVSpeechUtterance*)utterance{
    NSLog(@"---播放完成");
}
- (void)speechSynthesizer:(AVSpeechSynthesizer*)synthesizer didPauseSpeechUtterance:(AVSpeechUtterance*)utterance{
    NSLog(@"---暂停播放");
}
- (void)speechSynthesizer:(AVSpeechSynthesizer*)synthesizer didContinueSpeechUtterance:(AVSpeechUtterance*)utterance{
    NSLog(@"---继续播放");
}
- (void)speechSynthesizer:(AVSpeechSynthesizer*)synthesizer didCancelSpeechUtterance:(AVSpeechUtterance*)utterance{
    NSLog(@"---取消播放");
}

@end
