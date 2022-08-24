//
//  LoginGradientView.swift
//  PunchCardTogether
//
//  Created by zang qilong on 2022/7/31.
//

import Foundation
import SwiftUI

struct LoginGradientView<Content: View>: View {
    let content: Content
    @State var offset: CGFloat = 0
    
    init(@ViewBuilder content: () -> Content) {
        self.content = content()
    }
    
    var body: some View {
        ZStack {
            LinearGradient(gradient: Gradient(colors: [Color(hex6: 0x6FB0F4), Color(hex6: 0xA7D0FC)]), startPoint: .top, endPoint: .bottom)
                .ignoresSafeArea()
            ObservableScrollView(scrollOffset: $offset, content: { _ in
                content
            })
            .onChange(of: offset) { newValue in
                hideKeyboard()
            }
        }
    }
}
