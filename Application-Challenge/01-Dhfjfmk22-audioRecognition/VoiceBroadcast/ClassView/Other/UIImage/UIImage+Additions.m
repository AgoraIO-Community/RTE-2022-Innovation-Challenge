//
//  UIImage+Additions.m
//  FaceSharp
//
//  Created by 阿凡树 on 2017/5/17.
//  Copyright © 2017年 Baidu. All rights reserved.
//

#import "UIImage+Additions.h"

@implementation UIImage (Additions)

+ (UIImage *)imageWithColor:(UIColor *)color withSize:(CGSize)size {
    CGRect rect = CGRectMake(0, 0, size.width, size.height);
    UIGraphicsBeginImageContext(size);
    CGContextRef context = UIGraphicsGetCurrentContext();
    CGContextSetFillColorWithColor(context, [color CGColor]);
    CGContextFillRect(context, rect);
    UIImage *image = UIGraphicsGetImageFromCurrentImageContext();
    UIGraphicsEndImageContext();
    return image;
}
- (UIImage *)subImageAtRect:(CGRect)rect
{
    CGImageRef imageRef = CGImageCreateWithImageInRect(self.CGImage, rect);
    UIImage* subImage = [UIImage imageWithCGImage: imageRef];
    CGImageRelease(imageRef);
    return subImage;
}

- (NSString *)base64EncodedString {
    return [[self data] base64EncodedStringWithOptions:NSDataBase64EncodingEndLineWithLineFeed];
}

- (NSData *)dataWithCompress:(CGFloat)compress {
    NSData* data = UIImageJPEGRepresentation(self, compress);
    if (data == nil) {
        data = UIImagePNGRepresentation(self);
    }
    return data;
}

- (NSData *)data {
    NSData* data = UIImageJPEGRepresentation(self, 0.6);
    if (data == nil) {
        data = UIImagePNGRepresentation(self);
    }
    return data;
}

- (UIImage *)resizedToSize:(CGSize)size {
    UIGraphicsBeginImageContext(size);
    [self drawInRect:CGRectMake(0, 0, size.width, size.height)];
    UIImage* resultImage = UIGraphicsGetImageFromCurrentImageContext();
    UIGraphicsEndImageContext();
    return resultImage;
}

#define MAX_IMAGE_SIZE 1280
- (UIImage *)resizedFix {
    if (self.size.width < self.size.height) {
        if (self.size.height < MAX_IMAGE_SIZE) {
            return self;
        } else {
            return [self resizedToSize:CGSizeMake(self.size.width / self.size.height * MAX_IMAGE_SIZE, MAX_IMAGE_SIZE)];
        }
    } else {
        if (self.size.width < MAX_IMAGE_SIZE) {
            return self;
        } else {
            return [self resizedToSize:CGSizeMake(MAX_IMAGE_SIZE, self.size.height / self.size.width * MAX_IMAGE_SIZE)];
        }
    }
}

- (UIImage *)cropImageWithFaceLocation:(CGRect)faceRect showSize:(CGSize)showSize {
    if (showSize.height / showSize.width < self.size.height / self.size.width) {
        CGSize cropSize = CGSizeMake( self.size.width , showSize.height / showSize.width * self.size.width);
        CGFloat minY = cropSize.height / 2.0f;
        CGFloat maxY = self.size.height - minY;
        CGFloat faceCenterY = MAX(MIN((faceRect.origin.y + faceRect.size.height) / 2.0f, maxY), minY);
        CGRect cropRect = CGRectMake(0, faceCenterY - minY, cropSize.width, cropSize.height);
        return [self subImageAtRect:cropRect];
    } else {
        CGSize cropSize = CGSizeMake(showSize.width / showSize.height *  self.size.height , self.size.height);
        CGFloat minX = cropSize.width / 2.0f;
        CGFloat maxX = self.size.width - minX;
        CGFloat faceCenterX = MAX(MIN((faceRect.origin.x + faceRect.size.width) / 2.0f, maxX), minX);
        CGRect cropRect = CGRectMake(faceCenterX - minX, 0, cropSize.width, cropSize.height);
        return [self subImageAtRect:cropRect];
    }
}

@end
