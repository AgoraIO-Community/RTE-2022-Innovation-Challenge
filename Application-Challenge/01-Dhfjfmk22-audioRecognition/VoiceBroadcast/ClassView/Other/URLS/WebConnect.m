//
//  WebConnect.m
//  EasyFlowerCustomer
//
//  Created by 罗金 on 15/11/13.
//  Copyright © 2015年 chenglin.zhao. All rights reserved.
//

#import "WebConnect.h"
#import "AppDelegate.h"

static const NSString *pubkey = @"MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDyIGlSNYYbsc6iTOCH+/pnhYCv3XEsFFar0qpKMrQWETeR0ZcVO6gtrDodIz+JNu0jSiqWx7uJA15MDcEUSSAzGWmRC4LqYRNwY9R6pZ6unuho4nyCRN8Ui7wKc4famnC40qULRW7XXQQ7zS/MCHfcE9HrYqdB3b7EA0NasLpg2QIDAQAB";
static const NSString *fixedStr = @"EYtAv5VLHW394zIXw1fCSbQB8sgNmURZ";

static AFHTTPSessionManager *manager;

@interface WebConnect ()

@property (nonatomic, strong) void(^success)(id);
@property (nonatomic, strong) void(^failure)(id);
@property (nonatomic, strong) void(^formData)(id);

@end

@implementation WebConnect

- (instancetype)init{
    self = [super init];
    if (self) {
        NSURLSessionConfiguration *sessionConfig = [NSURLSessionConfiguration defaultSessionConfiguration];
        sessionConfig.timeoutIntervalForRequest = 20;
        sessionConfig.URLCache = [[NSURLCache alloc] initWithMemoryCapacity:4*1024*1024 diskCapacity:32*1024*1024 diskPath:@"com.baidu.FaceSharp"];
        _sessionManager = [[AFURLSessionManager alloc] initWithSessionConfiguration:sessionConfig];
        AFHTTPResponseSerializer* serializer = [AFHTTPResponseSerializer serializer];
        serializer.acceptableContentTypes = [NSSet setWithObjects:@"text/json",@"text/javascript",@"application/json",@"text/plain",@"text/html",@"application/xhtml+xml",@"application/xml",nil];
        _sessionManager.responseSerializer = serializer;
        _requestSerializer = [AFHTTPRequestSerializer serializer];
        _jsonRequestSerializer = [AFJSONRequestSerializer serializer];
    }
    return self;
}

// 发现 [AFHTTPSessionManager manager] 有内存泄漏问题
+(AFHTTPSessionManager *)sharedHttpSessionManager {
    static dispatch_once_t onceToken;
    dispatch_once(&onceToken, ^{
        manager = [AFHTTPSessionManager manager];
        manager.requestSerializer.timeoutInterval = 15.0;
    });
    
    return manager;
}

+ (AFSecurityPolicy *)customSecurityPolicy
{
    //先导入证书，找到证书的路径
    NSString *cerPath = [[NSBundle mainBundle] pathForResource:@"symbian" ofType:@"der"];
//    NSLog(@"呵呵%@",cerPath);
    NSData *certData = [NSData dataWithContentsOfFile:cerPath];
    
    //AFSSLPinningModeCertificate 使用证书验证模式
    AFSecurityPolicy *securityPolicy = [AFSecurityPolicy policyWithPinningMode:AFSSLPinningModeCertificate];
    
    //allowInvalidCertificates 是否允许无效证书（也就是自建的证书），默认为NO
    //如果是需要验证自建证书，需要设置为YES
    securityPolicy.allowInvalidCertificates = YES;
    
    //validatesDomainName 是否需要验证域名，默认为YES；
    //假如证书的域名与你请求的域名不一致，需把该项设置为NO；如设成NO的话，即服务器使用其他可信任机构颁发的证书，也可以建立连接，这个非常危险，建议打开。
    //置为NO，主要用于这种情况：客户端请求的是子域名，而证书上的是另外一个域名。因为SSL证书上的域名是独立的，假如证书上注册的域名是www.google.com，那么mail.google.com是无法验证通过的；当然，有钱可以注册通配符的域名*.google.com，但这个还是比较贵的。
    //如置为NO，建议自己添加对应域名的校验逻辑。
    securityPolicy.validatesDomainName = NO;
    NSSet *set = [[NSSet alloc] initWithObjects:certData, nil];
    securityPolicy.pinnedCertificates = set;
    
    return securityPolicy;
}

#pragma mark -- face网络请求
+ (NSURLSessionDataTask *)postDataWithPath:(NSString *)path
                                parameters:(id)parameters
                                completion:(FinishBlockWithObject)completionBlock {
    NSURLSessionConfiguration *sessionConfig = [NSURLSessionConfiguration defaultSessionConfiguration];
    sessionConfig.timeoutIntervalForRequest = 20;
    sessionConfig.URLCache = [[NSURLCache alloc] initWithMemoryCapacity:4*1024*1024 diskCapacity:32*1024*1024 diskPath:@"com.baidu.FaceSharp"];
    AFURLSessionManager *sessionManager = [[AFURLSessionManager alloc] initWithSessionConfiguration:sessionConfig];
    AFHTTPResponseSerializer* serializer = [AFHTTPResponseSerializer serializer];
    serializer.acceptableContentTypes = [NSSet setWithObjects:@"text/json",@"text/javascript",@"application/json",@"text/plain",@"text/html",@"application/xhtml+xml",@"application/xml",nil];
    sessionManager.responseSerializer = serializer;
    AFHTTPRequestSerializer *requestSerializer = [AFHTTPRequestSerializer serializer];
    AFJSONRequestSerializer *jsonRequestSerializer = [AFJSONRequestSerializer serializer];
    
    NSMutableURLRequest* postRequest = [[NSMutableURLRequest alloc] initWithURL:[NSURL URLWithString:path]];
    postRequest.HTTPMethod = @"POST";
    NSError* error = nil;
    if ([path hasSuffix:@"oauth/2.0/token"]) {
        postRequest = [[requestSerializer requestBySerializingRequest:postRequest withParameters:parameters error:&error] mutableCopy];
    } else {
        postRequest = [[jsonRequestSerializer requestBySerializingRequest:postRequest withParameters:parameters error:&error] mutableCopy];
    }
    
    if (error != nil) {
        NSLog(@"error = %@",error);
    }
    NSURLSessionDataTask* task = [sessionManager dataTaskWithRequest:postRequest completionHandler:^(NSURLResponse * _Nonnull response, id  _Nullable responseObject, NSError * _Nullable error) {
        completionBlock(error,responseObject);
    }];
    [task resume];
    return task;
}

#pragma Mark-- 网络请求格式
+ (void)webGETConnectWithWithStrUrl:(NSString *)strUrl pramaters:(NSDictionary *)pramaters success:(void(^)(id responseObject))sucess failure:(void(^)(id failure))failure
{
    WebConnect *connect = [[WebConnect alloc] init];
    connect.success = sucess;
    connect.failure = failure;
    [connect webGETConnectWithWithStrUrl:strUrl pramaters:pramaters];
}

+ (void)webPOSTConnectWithWithStrUrl:(NSString *)strUrl pramaters:(NSDictionary *)pramaters success:(void(^)(id responseObject))sucess failure:(void(^)(id failure))failure
{
    WebConnect *connect = [[WebConnect alloc] init];
    connect.success = sucess;
    connect.failure = failure;
    [connect webPOSTConnectWithWithStrUrl:strUrl pramaters:pramaters];
}

- (void)webGETConnectWithWithStrUrl:(NSString *)strUrl pramaters:(NSDictionary *)pramaters
{
    AFHTTPSessionManager *manage = [AFHTTPSessionManager manager];
    
    manage.requestSerializer.timeoutInterval = 15.f;
    //HTTPS SSL的验证，在此处调用上面的代码，给这个证书验证；
//    [manage setSecurityPolicy:[WebConnect customSecurityPolicy]];
    //将token封装入请求头
//    [manage.requestSerializer setValue:[WebConnect getHeaders] forHTTPHeaderField:@"token"];
//    [manage.requestSerializer setValue:[YLAPPToolHandle toolHandleShare].tokenString forHTTPHeaderField:@"token"];
    
    manage.responseSerializer.acceptableContentTypes = [NSSet setWithObjects:@"application/json", @"text/json", @"text/javascript", @"text/html", @"text/plain", nil];
        
    NSLog(@"网址 == %@ 参数 == %@", strUrl, pramaters);
    
    [manage GET:strUrl parameters:pramaters progress:^(NSProgress * _Nonnull downloadProgress){
        
    } success:^(NSURLSessionDataTask * _Nonnull task, id  _Nullable responseObject)
     {
         NSHTTPURLResponse *response = (NSHTTPURLResponse *)task.response;
         NSDictionary *allHeaders = response.allHeaderFields;
         
         NSString *tokenString = [NSString stringWithFormat:@"%@",[allHeaders objectForKey:@"token"]];
         
         //将token保存在单例中
//         [YLAPPToolHandle toolHandleShare].tokenString = tokenString;
         
//         NSLog(@"token == %@",[YLAPPToolHandle toolHandleShare].tokenString);
         
         self.success(responseObject);
     }
        failure:^(NSURLSessionDataTask * _Nullable task, NSError * _Nonnull   error)
     {
//         [WebConnect errorMessage:task];
         self.failure(error);
     }];
    
}


- (void)webPOSTConnectWithWithStrUrl:(NSString *)strUrl pramaters:(NSDictionary *)pramaters
{
    
    NSLog(@"网址 == %@ 参数 == %@", strUrl, pramaters);

    AFHTTPSessionManager *manage = [AFHTTPSessionManager manager];

    //HTTPS SSL的验证，在此处调用上面的代码，给这个证书验证；
    manage.responseSerializer.acceptableContentTypes = [NSSet setWithObjects:@"application/json", @"text/json", @"text/javascript", @"text/html", @"text/plain", nil];
        
    [manage.requestSerializer setValue:@"application/json" forHTTPHeaderField:@"Content-Type"];
    
    [manage.requestSerializer setValue:@"application/x-www-form-urlencoded" forHTTPHeaderField:@"Content-Type"];
    manage.requestSerializer = [AFJSONRequestSerializer serializer];

    [manage POST:strUrl parameters:pramaters constructingBodyWithBlock:^(id<AFMultipartFormData> _Nonnull formData){
        
    } progress:^(NSProgress * _Nonnull uploadProgress){
        
    } success:^(NSURLSessionDataTask * _Nonnull task, id  _Nullable responseObject)
     {
         NSHTTPURLResponse *response = (NSHTTPURLResponse *)task.response;
         NSDictionary *allHeaders = response.allHeaderFields;
         
         NSString *tokenString = [NSString stringWithFormat:@"%@",[allHeaders objectForKey:@"token"]];
         
         //将token保存在单例中
//         [YLAPPToolHandle toolHandleShare].tokenString = tokenString;
         
//         NSLog(@"token == %@",[YLAPPToolHandle toolHandleShare].tokenString);
         
         self.success(responseObject);
     } failure:^(NSURLSessionDataTask * _Nullable task, NSError * _Nonnull error){
         
//         [WebConnect errorMessage:task];
         self.failure(error);
         
         NSLog(@"NSError === %@",error);
     }];
    
}

+ (void)webConnectLoginUrl:(NSString *)url parameters:(NSMutableDictionary *)parametres response:(void(^)(id data))res fail:(void(^)(NSString *data))fail
{
    
    AFHTTPSessionManager *manager = [AFHTTPSessionManager manager];
    manager.responseSerializer.acceptableContentTypes = [NSSet setWithObjects:@"application/json", @"text/json", @"text/javascript", @"text/html", @"text/plain", nil];
    manager.responseSerializer = [AFJSONResponseSerializer serializer];
    manager.requestSerializer = [AFJSONRequestSerializer serializer];
    manager.requestSerializer.timeoutInterval = 15.f;
    [manager.requestSerializer setValue:@"application/json" forHTTPHeaderField:@"Content-Type"];
    //    [manager.requestSerializer setValue:@"MQ:1YzyO2:SAvcJ31OEFZDcv-Yb38AFmvq8e4" forHTTPHeaderField:@"token"];
    
    [manager POST:url parameters:parametres progress:^(NSProgress * _Nonnull uploadProgress){
        
    } success:^(NSURLSessionDataTask * _Nonnull task, id  _Nullable responseObject)
     {
         res(responseObject);
         
     } failure:^(NSURLSessionDataTask * _Nullable task, NSError * _Nonnull error)
     {
//         fail([WebConnect errorMessage:task]);
//         fail(error);
     }];
    
    //    [manager POST:url parameters:parametres success:^(AFHTTPRequestOperation *operation, id responseObject) {
    //        //        NSLog(@"responseObject == %@", responseObject);
    //        res(responseObject);
    //
    //    } failure:^(AFHTTPRequestOperation *operation, NSError *error) {
    //        fail([WebConnect errorMessage:operation]);
    //
    //    }];
}


+ (void)webConnetCAP:(NSString *)url phone:(NSString *)phone sucess:(void(^)(id data))sucess fail:(void(^)(NSString *data))fail
{
    NSMutableDictionary *parameters = [NSMutableDictionary dictionaryWithObjectsAndKeys:phone, @"phone", nil];
    AFHTTPSessionManager *manager = [AFHTTPSessionManager manager];
    manager.responseSerializer.acceptableContentTypes = [NSSet setWithObjects:@"application/json", @"text/json", @"text/javascript", @"text/html", @"text/plain", nil];
    manager.requestSerializer.timeoutInterval = 15.f;
    manager.responseSerializer = [AFJSONResponseSerializer serializer];
    manager.requestSerializer = [AFJSONRequestSerializer serializer];
    [manager.requestSerializer setValue:@"application/json" forHTTPHeaderField:@"Content-Type"];
    
    [manager POST:url parameters:parameters progress:^(NSProgress * _Nonnull uploadProgress){
        
    } success:^(NSURLSessionDataTask * _Nonnull task, id  _Nullable responseObject)
     {
         sucess(responseObject);
         
     } failure:^(NSURLSessionDataTask * _Nullable task, NSError * _Nonnull error)
     {
//         fail([WebConnect errorMessage:task]);
//         fail(error);
     }];
    
    //    [manager POST:url parameters:parameters success:^(AFHTTPRequestOperation *operation, id responseObject) {
    //        sucess(responseObject);
    //    } failure:^(AFHTTPRequestOperation *operation, NSError *error) {
    //        fail([WebConnect errorMessage:operation]);
    //
    //    }];
}

+ (void)webConnetResgin:(NSString *)url parameters:(NSMutableDictionary *)parameters sucess:(void(^)(id data))sucess fail:(void(^)(NSString *))fail
{
    AFHTTPSessionManager *manager = [AFHTTPSessionManager manager];
    manager.responseSerializer.acceptableContentTypes = [NSSet setWithObjects:@"application/json", @"text/json", @"text/javascript", @"text/html", @"text/plain", nil];
    manager.requestSerializer.timeoutInterval = 15.f;
    manager.responseSerializer = [AFJSONResponseSerializer serializer];
    manager.requestSerializer = [AFJSONRequestSerializer serializer];
    [manager.requestSerializer setValue:@"application/json" forHTTPHeaderField:@"Content-Type"];
    
    [manager POST:url parameters:parameters progress:^(NSProgress * _Nonnull uploadProgress){
        
    } success:^(NSURLSessionDataTask * _Nonnull task, id  _Nullable responseObject)
     {
         sucess(responseObject);
         
     } failure:^(NSURLSessionDataTask * _Nullable task, NSError * _Nonnull error)
     {
//         fail([WebConnect errorMessage:task]);
     }];
    
    //    [manager POST:url parameters:parameters success:^(AFHTTPRequestOperation *operation, id responseObject) {
    //        sucess(responseObject);
    //    } failure:^(AFHTTPRequestOperation *operation, NSError *error) {
    //        fail([WebConnect errorMessage:operation]);
    //
    //    }];
    
}




+ (void)webConnetCAPlogin:(NSString *)url parameters:(NSMutableDictionary *)parameters sucess:(void(^)(id data))sucess fail:(void(^)(NSString *error))fail
{
    AFHTTPSessionManager *manager = [AFHTTPSessionManager manager];
    manager.requestSerializer.timeoutInterval = 15.f;

    manager.responseSerializer.acceptableContentTypes = [NSSet setWithObjects:@"application/json", @"text/json", @"text/javascript", @"text/html", @"text/plain", nil];
    manager.responseSerializer = [AFJSONResponseSerializer serializer];
    manager.requestSerializer = [AFJSONRequestSerializer serializer];
    [manager.requestSerializer setValue:@"application/json" forHTTPHeaderField:@"Content-Type"];
    
    [manager POST:url parameters:parameters progress:^(NSProgress * _Nonnull uploadProgress){
        
    } success:^(NSURLSessionDataTask * _Nonnull task, id  _Nullable responseObject)
     {
         sucess(responseObject);
         
     } failure:^(NSURLSessionDataTask * _Nullable task, NSError * _Nonnull error)
     {
//         fail([WebConnect errorMessage:task]);
     }];
    
    //    [manager POST:url parameters:parameters success:^(AFHTTPRequestOperation *operation, id responseObject) {
    //        sucess(responseObject);
    //    } failure:^(AFHTTPRequestOperation *operation, NSError *error) {
    //        NSString *errorMessage = [WebConnect errorMessage:operation];
    //        fail(errorMessage);
    //    }];
    
}
//判断(null)
+ (BOOL)isNIll:(id)str
{
    NSString *sss = [NSString stringWithFormat:@"%@", str];
    if ([sss isKindOfClass:[NSString class]]) {
        if ([sss isEqualToString:@""] || sss == nil || [sss isKindOfClass:[NSNull class]] || [sss isEqualToString:@"(null)"] || [sss isEqualToString:@"<null>"]) {
            return YES;
        } else {
            return NO;
        }
        
    } else {
        return YES;
    }
    
}

+ (void)webConnetPostType:(NSString *)url parameters:(NSMutableDictionary *)parameters sucess:(void(^)(id data))sucess fail:(void(^)(NSString *error))fail
{
    AFHTTPSessionManager *manager = [AFHTTPSessionManager manager];
    manager.responseSerializer.acceptableContentTypes = [NSSet setWithObjects:@"application/json", @"text/json", @"text/javascript", @"text/html", @"text/plain", nil];
    manager.requestSerializer.timeoutInterval = 15.f;
    manager.responseSerializer = [AFJSONResponseSerializer serializer];
    manager.requestSerializer = [AFJSONRequestSerializer serializer];
    [manager.requestSerializer setValue:@"application/json" forHTTPHeaderField:@"Content-Type"];
    
    [manager POST:url parameters:parameters progress:^(NSProgress * _Nonnull uploadProgress){
        
    } success:^(NSURLSessionDataTask * _Nonnull task, id  _Nullable responseObject)
     {
         sucess(responseObject);
         
     } failure:^(NSURLSessionDataTask * _Nullable task, NSError * _Nonnull error)
     {
//         fail([WebConnect errorMessage:task]);
         
     }];
    
    //    [manager POST:url parameters:parameters success:^(AFHTTPRequestOperation *operation, id responseObject) {
    //        sucess(responseObject);
    //    } failure:^(AFHTTPRequestOperation *operation, NSError *error) {
    //        fail([WebConnect errorMessage:operation]);
    //
    //    }];
    
}

+ (void)webConnetGetAndType:(NSString *)url parameters:(NSMutableDictionary *)parameters sucess:(void(^)(id data))sucess fail:(void(^)(NSString *))fail
{
    AFHTTPSessionManager *manager = [AFHTTPSessionManager manager];
    manager.requestSerializer.timeoutInterval = 15.f;

    manager.responseSerializer.acceptableContentTypes = [NSSet setWithObjects:@"application/json", @"text/json", @"text/javascript", @"text/html", @"text/plain", nil];
    manager.responseSerializer = [AFJSONResponseSerializer serializer];
    manager.requestSerializer = [AFJSONRequestSerializer serializer];
    //    NSString *token = [GetToken getToken];
    //    [manager.requestSerializer setValue:token forHTTPHeaderField:@"token"];
    [manager.requestSerializer setValue:@"application/json" forHTTPHeaderField:@"Content-Type"];
    
    [manager GET:url parameters:parameters progress:^(NSProgress * _Nonnull downloadProgress){
        
    } success:^(NSURLSessionDataTask * _Nonnull task, id  _Nullable responseObject)
     {
         sucess(responseObject);
     }
         failure:^(NSURLSessionDataTask * _Nullable task, NSError * _Nonnull   error)
     {
//         fail([WebConnect errorMessage:task]);
         
     }];
    
    //    [manager GET:url parameters:parameters success:^(AFHTTPRequestOperation *operation, id responseObject) {
    //        sucess(responseObject);
    //
    //    } failure:^(AFHTTPRequestOperation *operation, NSError *error) {
    //
    //        fail([WebConnect errorMessage:operation]);
    //    }];
}


+ (NSString *)errorMessage:(NSURLSessionDataTask *)operation
{
    NSString *er = @"";
    if (operation.response != nil) {
        
        NSLog(@"operation.response === %@",operation.response);
        
        NSData *data = (NSData *)operation.response;
        NSLog(@"转换后%@",data);
        NSMutableDictionary *dic = [NSJSONSerialization JSONObjectWithData:data options:NSJSONReadingMutableContainers error:nil];
        
        NSString *error = [[NSString alloc] initWithData:data encoding:NSUTF8StringEncoding];
        
        if (dic == nil && [WebConnect isNIll:error]) {
            //            er = @"未知错误";
            //            NSLog(@"%@", er);
            er = @"";
        }
        else if (![WebConnect isNIll:[dic objectForKey:@"detail"]]) {
            if([[dic objectForKey:@"detail"] isKindOfClass:[NSArray class]])
            {
                NSArray *arr =  [dic objectForKey:@"detail"];
                if (arr.count > 0) {
                    
                    er = [arr firstObject];
                } else {
                    //                    er = @"未知错误";
                    //                    NSLog(@"%@", er);
                    er = @"";
                }
                
            } else {
                er = [dic objectForKey:@"detail"];
            }
            
        } else {
            
        }
        
    }
    
    if (![WebConnect isNIll:er]) {
        
        if ([er isEqualToString:@"验证码错误"]) {
            
        } else {
            //
            //            [AutoMissMessage showInView:[[UIApplication sharedApplication] keyWindow] frame:MESSAGE_RECT message:er];
        }
    } else {
        //        NSLog(@"error 为空");
        
    }
    if ([er isKindOfClass:[NSString class]]) {
        if ([er isEqualToString:@"无此用户"]) {
            //            SingleInstanse *single = [SingleInstanse singleInstanse];
            //            single.hasLog = @"NO";
            //            single.token = @"";
            //            single.uid = @"";
            //            // 清除用户数据
            //            [GetToken userIsResgin];
            //            [single.budgeView removeFromSuperview];
            //            [DayTextHistory setHasDo:YES];
            //            [[NSNotificationCenter defaultCenter] postNotificationName:@"login" object:nil];
        }
    }
    return er;
}

@end

