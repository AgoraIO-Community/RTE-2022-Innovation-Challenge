//
//  PCFont.swift
//  PunchCardTogether
//
//  Created by zang qilong on 2022/7/31.
//

import Foundation
import SwiftUI
import UIKit

enum PCFont {
    case puhui
}

enum PCFontStyle {
    case heavy
    case bold
    case medium
}

extension PCFont {
    func font(size: CGFloat, style: PCFontStyle) -> Font {
        switch self {
        case .puhui:
            switch style {
            case .heavy:
                return Font.custom("Alibaba-PuHuiTi-H", size: size)
            case .bold:
                return Font.custom("Alibaba-PuHuiTi-B", size: size)
            case .medium:
                return Font.custom("Alibaba-PuHuiTi-M", size: size)
            }
        }
    }
    
    func uifont(size: CGFloat, style: PCFontStyle) -> UIFont? {
        switch self {
        case .puhui:
            switch style {
            case .heavy:
                return UIFont(name: "Alibaba-PuHuiTi-H", size: size)
            case .bold:
                return UIFont(name:"Alibaba-PuHuiTi-B", size: size)
            case .medium:
                return UIFont(name:"Alibaba-PuHuiTi-M", size: size)
            }
        }
    }
}
