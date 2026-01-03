//
//  FaceAppToolHandle.m
//  FaceDiscernmentDemo
//
//  Created by mac on 2019/2/22.
//  Copyright © 2019年 mac. All rights reserved.
//

#import "FaceAppToolHandle.h"

@implementation FaceAppToolHandle

//@synthesize accessToken = _accessToken;

+(instancetype)shareToolHandle{
    static dispatch_once_t once;
    static FaceAppToolHandle *shareToolHandle = nil;
    dispatch_once(&once,^{
        shareToolHandle = [[FaceAppToolHandle alloc]init];
    });
    return shareToolHandle;
}

//获取access_token
//- (void)setAccessToken:(NSString *)accessToken{
//    _accessToken = accessToken;
//    NSUserDefaults *tokenDefaults = [NSUserDefaults standardUserDefaults];
//    [tokenDefaults setObject:accessToken forKey:@"access_token"];
//    [[NSUserDefaults standardUserDefaults]synchronize];
//}
//- (NSString *)accessToken{
//    return [[NSUserDefaults standardUserDefaults]objectForKey:@"access_token"];
//}

@end
