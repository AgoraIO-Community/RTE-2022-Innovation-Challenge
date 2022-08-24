//
//  DCDetailViewController.h
//  Goods FLow
//
//  Created by hudachui on 2022/7/25.
//

#import <UIKit/UIKit.h>
#import "DCMessageModel.h"
NS_ASSUME_NONNULL_BEGIN

@interface DCDetailViewController : UIViewController
@property(assign,nonatomic)NSUInteger numOfPic;
@property(strong,nonatomic)DCMessageModel * model;

@end

NS_ASSUME_NONNULL_END
