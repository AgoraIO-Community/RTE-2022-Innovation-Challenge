//
//  MessageDBManager.h
//  Goods FLow
//
//  Created by hudachui on 2022/7/24.
//

#import <Foundation/Foundation.h>
#import "BBMessageModel.h"
NS_ASSUME_NONNULL_BEGIN

@interface MessageDBManager : NSObject
+(instancetype _Nonnull ) alloc __attribute__((unavailable("call sharedInstance instead")));
+(instancetype _Nonnull ) new __attribute__((unavailable("call sharedInstance instead")));
-(instancetype _Nonnull ) copy __attribute__((unavailable("call sharedInstance instead")));
-(instancetype _Nonnull ) mutableCopy __attribute__((unavailable("call sharedInstance instead")));
+(instancetype) sharedInstance;
-(void) addMessage:(NSArray<BBMessageModel*>*)aMessages;
-(NSArray<BBMessageModel*>*) loadMessages;
- (UIImage *)getCacheImageUseImagePath:(NSString *)imagePath;

@end

NS_ASSUME_NONNULL_END
