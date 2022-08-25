//
//  LoginInputView.swift
//  PunchCardTogether
//
//  Created by zang qilong on 2022/7/31.
//

import Foundation
import SwiftUI

struct LoginInputView: View {
    @Binding var bindingText: String
    
    var placeholder: String
    
    var body: some View {
        VStack {
            TextField(placeholder, text: $bindingText)
                .font(.system(size: 27, weight: .medium))
                .foregroundColor(.white)
                .multilineTextAlignment(.center)
            Divider()
                .overlay(.white)
        }
    }
}
