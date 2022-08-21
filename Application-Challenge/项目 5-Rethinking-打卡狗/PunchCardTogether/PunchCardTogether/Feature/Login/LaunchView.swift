//
//  Login.swift
//  PunchCardTogether
//
//  Created by zang qilong on 2022/7/31.
//

import SwiftUI

struct LaunchView: View {
    var body: some View {
        LoginGradientView {
            VStack {
                Image("login_logo")
                Text("KAGO")
                    .font(PCFont.puhui.font(size: 82, style: .heavy))
                    .foregroundColor(.white)
                Text("打卡狗")
                    .font(PCFont.puhui.font(size: 40, style: .heavy))
                    .foregroundColor(.white)
            }
        }
    }
}

struct LaunchView_Previews: PreviewProvider {
    static var previews: some View {
        LaunchView()
    }
}
