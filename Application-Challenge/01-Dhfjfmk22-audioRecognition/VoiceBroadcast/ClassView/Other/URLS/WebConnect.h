//
//  WebConnect.h
//  EasyFlowerCustomer
//
//  Created by 罗金 on 15/11/13.
//  Copyright © 2015年 chenglin.zhao. All rights reserved.
//

#import <Foundation/Foundation.h>
#import "AFHTTPSessionManager.h"

typedef void (^FinishBlockWithObject)(NSError *error, id resultObject);

@interface WebConnect : NSObject

@property(nonatomic) AFURLSessionManager *sessionManager;
@property(nonatomic) AFHTTPRequestSerializer *requestSerializer;
@property(nonatomic) AFJSONRequestSerializer *jsonRequestSerializer;

+ (void)webGETConnectWithWithStrUrl:(NSString *)strUrl pramaters:(NSDictionary *)pramaters success:(void(^)(id responseObject))sucess failure:(void(^)(id failure))failure;

+ (void)webPOSTConnectWithWithStrUrl:(NSString *)strUrl pramaters:(NSDictionary *)pramaters success:(void(^)(id responseObject))sucess failure:(void(^)(id failure))failure;

+ (BOOL)isNIll:(id)str;

+(NSString *)getHeaders;

/**
 * post 请求
 */
+ (NSURLSessionDataTask *)postDataWithPath:(NSString *)path
                                parameters:(id)parameters
                                completion:(FinishBlockWithObject)completionBlock;

@end
