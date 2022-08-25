//
//  Color+Extension.swift
//  PunchCardTogether
//
//  Created by zang qilong on 2022/7/31.
//

import Foundation
import SwiftUI

public extension Color {
    
    /**
     The three-digit hexadecimal representation of color.
     
     - parameter hex3: Three-digit hexadecimal value in 0xRGB format.
     - parameter opacity: 0.0 - 1.0. The default is 1.0.
     */
    init(hex3: UInt16, opacity: Double = 1) {
        let divisor = Double(0x0F)
        let red = Double((hex3 & 0xF00) >> 8) / divisor
        let green = Double((hex3 & 0x0F0) >> 4) / divisor
        let blue = Double(hex3 & 0x00F) / divisor
        
        self.init(red: red, green: green, blue: blue, opacity: opacity)
    }
    
    /**
     The four-digit hexadecimal representation of color with opacity.
     
     - parameter hex4: Four-digit hexadecimal value in 0xRGBA format.
     */
    init(hex4: UInt16) {
        let divisor = Double(0x0F)
        let red = Double((hex4 & 0xF000) >> 12) / divisor
        let green = Double((hex4 & 0x0F00) >> 8) / divisor
        let blue = Double((hex4 & 0x00F0) >> 4) / divisor
        let opacity = Double(hex4 & 0x000F) / divisor
        
        self.init(red: red, green: green, blue: blue, opacity: opacity)
    }
    
    /**
     The six-digit hexadecimal representation of color.
     
     - parameter hex6: Six-digit hexadecimal value in 0xRRGGBB format.
     - parameter opacity: 0.0 - 1.0. The default is 1.0.
     */
    init(hex6: UInt32, opacity: Double = 1) {
        let divisor = Double(0xFF)
        let red = Double((hex6 & 0xFF0000) >> 16) / divisor
        let green = Double((hex6 & 0x00FF00) >> 8) / divisor
        let blue = Double(hex6 & 0x0000FF) / divisor
        
        self.init(red: red, green: green, blue: blue, opacity: opacity)
    }
    
    /**
     The eight-digit hexadecimal representation of color with opacity.
     
     - parameter hex8: Eight-digit hexadecimal value in 0xRRGGBBAA format.
     */
    init(hex8: UInt32) {
        let divisor = Double(0xFF)
        let red = Double((hex8 & 0xFF000000) >> 24) / divisor
        let green = Double((hex8 & 0x00FF0000) >> 16) / divisor
        let blue = Double((hex8 & 0x0000FF00) >> 8) / divisor
        let opacity = Double(hex8 & 0x000000FF) / divisor
        
        self.init(red: red, green: green, blue: blue, opacity: opacity)
    }
    
    /**
     The hexadecimal representation of color.
     
     - parameter hex: Hexadecimal value in "#RGB" or "#RGBA" or "#RRGGBB" or "#RRGGBBAA" format.
     */
    init(hex: String) {
        let hexString = hex.replacingOccurrences(of: "#", with: "")
        
        var intValue: UInt64 = 0
        
        let scanner = Scanner(string: hexString)
        scanner.scanHexInt64(&intValue)
        
        switch hexString.count {
        case 3:
            self.init(hex3: UInt16(intValue))
        case 4:
            self.init(hex4: UInt16(intValue))
        case 6:
            self.init(hex6: UInt32(intValue))
        case 8:
            self.init(hex8: UInt32(intValue))
        default:
            self.init(red: 0, green: 0, blue: 0)
        }
    }
    
}

extension UIColor {
   convenience init(red: Int, green: Int, blue: Int) {
       assert(red >= 0 && red <= 255, "Invalid red component")
       assert(green >= 0 && green <= 255, "Invalid green component")
       assert(blue >= 0 && blue <= 255, "Invalid blue component")

       self.init(red: CGFloat(red) / 255.0, green: CGFloat(green) / 255.0, blue: CGFloat(blue) / 255.0, alpha: 1.0)
   }

   convenience init(rgb: Int) {
       self.init(
           red: (rgb >> 16) & 0xFF,
           green: (rgb >> 8) & 0xFF,
           blue: rgb & 0xFF
       )
   }
}
