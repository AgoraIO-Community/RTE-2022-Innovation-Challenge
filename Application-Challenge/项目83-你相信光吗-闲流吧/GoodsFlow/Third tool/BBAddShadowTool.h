//
//  BBAddShadowTool.h
//  Goods FLow
//
//  Created by hudachui on 2022/7/28.
//

#import <UIKit/UIKit.h>

NS_ASSUME_NONNULL_BEGIN

@interface BBAddShadowTool : NSObject
+ (void)addShadowToView:(UIView *)theView;
+ (void)addShadowToViewOnlyBottom:(UIView *)theView;
@end

NS_ASSUME_NONNULL_END
