//
//  LoginButton.swift
//  PunchCardTogether
//
//  Created by zang qilong on 2022/7/31.
//

import SwiftUI

struct LoginButton: View {
    @Binding var enable: Bool
    let title: String
    let action: () -> Void
    var body: some View {
        Button {
            action()
        } label: {
            Text(title)
                .font(.system(size: 17, weight: .semibold))
                .foregroundColor(.white)
                .frame(maxWidth: .infinity)
                .frame(height: 44)
                .background(Color(hex6: 0xD4744A).opacity(enable ? 1.0 : 0.5))
                .cornerRadius(30)
                .padding(.horizontal, 32)
        }
        .disabled(!enable)
    }
}
