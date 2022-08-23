//
//  BBDetailViewController.h
//  Goods FLow
//
//  Created by hudachui on 2022/7/25.
//

#import <UIKit/UIKit.h>
#import "BBMessageModel.h"
NS_ASSUME_NONNULL_BEGIN

@interface BBDetailViewController : UIViewController
@property(assign,nonatomic)NSUInteger numOfPic;
@property(strong,nonatomic)BBMessageModel * model;

@end

NS_ASSUME_NONNULL_END
