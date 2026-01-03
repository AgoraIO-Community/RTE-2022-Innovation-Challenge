//
//  NSString+Additions.m
//  FaceSharp
//
//  Created by 阿凡树 on 2017/6/8.
//  Copyright © 2017年 Baidu. All rights reserved.
//

#import "NSString+Additions.h"
#import <CommonCrypto/CommonDigest.h>

@implementation NSString (Additions)

- (NSString *)md5String {
    unsigned char r[CC_MD5_DIGEST_LENGTH];
    CC_MD5([self UTF8String], (unsigned int)[self lengthOfBytesUsingEncoding:NSUTF8StringEncoding], r);
    return [NSString stringWithFormat:@"%02x%02x%02x%02x%02x%02x%02x%02x%02x%02x%02x%02x%02x%02x%02x%02x",r[0], r[1], r[2], r[3],r[4], r[5], r[6], r[7],r[8], r[9], r[10], r[11],r[12], r[13], r[14], r[15]];
}

@end
