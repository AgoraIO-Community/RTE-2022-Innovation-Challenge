//
//  ChoosePhotoAndVideoController.h
//  Goods FLow
//
//  Created by hudachui on 2022/7/25.
//

#import <UIKit/UIKit.h>

NS_ASSUME_NONNULL_BEGIN

@interface ChoosePhotoAndVideoController : UIViewController

@property(nonatomic,copy) void(^completeChoosePic) (NSArray * arr);

@end

NS_ASSUME_NONNULL_END
