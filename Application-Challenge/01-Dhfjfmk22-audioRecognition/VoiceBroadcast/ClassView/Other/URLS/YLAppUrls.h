//
//  YLAppUrls.h
//  YLBSApp
//
//  Created by 段国立 on 2017/7/19.
//  Copyright © 2017年 DGL. All rights reserved.
//

#ifndef YLAppUrls_h
#define YLAppUrls_h

/**
 *  正式环境
 */
//#define YL_INSIDEURL @"http://openapi.yilingboshi.com"
//
//#define YL_ejsimage @"http://images.yilingboshi.com/ejsimage"
//
//#define YL_H5 @"http://h5.yilingboshi.com"

/**
 * 演示环境
 */
#define YL_INSIDEURL @"http://uat.api.yilingboshi.com"

#define YL_ejsimage @"http://images.yilingboshi.com/ejsimage"

#define YL_H5 @"http://uat.apph5.yilingboshi.com"

/**
 *  测试环境
 */
//#define YL_INSIDEURL @"http://test.openapi.yilingboshi.com"
//
//#define YL_ejsimage @"http://test.images.yilingboshi.com/ejsimage"
//
//#define YL_H5 @"http://test.h5.yilingboshi.com"



/** 登录 获取token信息 */
#define YL_LOGINURL [NSString stringWithFormat:@"%@%@%@",YL_INSIDEURL,@"/app/login",sourceTypes]

/**获取token信息*/
#define Baidu_getTokenURL [NSString stringWithFormat:@"%@",@"https://aip.baidubce.com/oauth/2.0/token"]

/**百度语音-*/
#define Baidu_getFacesetUserAddURL [NSString stringWithFormat:@"%@",@"http://vop.baidu.com/server_api"]


#endif /* YLAppUrls_h */




