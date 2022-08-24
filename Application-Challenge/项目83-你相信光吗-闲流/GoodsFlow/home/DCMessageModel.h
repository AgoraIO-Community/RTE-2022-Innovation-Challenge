//
//  DCMessageModel.h
//  Goods FLow
//
//  Created by hudachui on 2022/7/24.
//

#import <Foundation/Foundation.h>

NS_ASSUME_NONNULL_BEGIN

@interface DCMessageModel : NSObject
@property(copy,nonatomic)NSString * goodsid;
@property(copy,nonatomic)NSString * userid;
@property(copy,nonatomic)NSString * title;
@property(copy,nonatomic)NSString * des;
@property(copy,nonatomic)NSString * address;
@property(copy,nonatomic)NSString * phoneNum;
@property(copy,nonatomic)NSString * imgName;
@property(assign,nonatomic)NSInteger timestamp;
@property(copy,nonatomic)NSString * pName;
@property(copy,nonatomic)NSString * pcategory;

@end

NS_ASSUME_NONNULL_END
