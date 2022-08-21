//
//  HeightPreferenceKey.swift
//  PunchCardTogether
//
//  Created by zang qilong on 2022/8/17.
//

import Foundation
import SwiftUI

struct HeightPreferenceKey: PreferenceKey {
    static func reduce(value: inout CGFloat, nextValue: () -> CGFloat) {
        value = nextValue()
    }
    
    static var defaultValue: CGFloat = 0
}

struct MeasureHeightModifier: ViewModifier {
    func body(content: Content) -> some View {
        content.background(GeometryReader { geometry in
            Color.clear.preference(key: HeightPreferenceKey.self,
                                   value: geometry.size.height)
        })
    }
}

extension View {
  func measureHeight(perform action: @escaping (CGFloat) -> Void) -> some View {
    self.modifier(MeasureHeightModifier())
      .onPreferenceChange(HeightPreferenceKey.self, perform: action)
  }
}
