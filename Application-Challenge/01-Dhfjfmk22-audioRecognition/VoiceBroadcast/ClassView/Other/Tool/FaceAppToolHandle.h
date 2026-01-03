//
//  FaceAppToolHandle.h
//  FaceDiscernmentDemo
//
//  Created by mac on 2019/2/22.
//  Copyright © 2019年 mac. All rights reserved.
//

#import <Foundation/Foundation.h>

NS_ASSUME_NONNULL_BEGIN

@interface FaceAppToolHandle : NSObject
//单例
+(instancetype)shareToolHandle;

//access_token
//@property (nonatomic,strong) NSString *accessToken;

@end

NS_ASSUME_NONNULL_END
