//
//  BBMessageModel.m
//  Goods FLow
//
//  Created by hudachui on 2022/7/24.
//

#import "BBMessageModel.h"

@implementation BBMessageModel

- (void)setValue:(id)value forUndefinedKey:(NSString *)key{
    if ([key isEqualToString:@"name"]) {
        self.pName = value;
    }
    
    if ([key isEqualToString:@"category"]) {
        self.pcategory = value;
    }
}

@end
