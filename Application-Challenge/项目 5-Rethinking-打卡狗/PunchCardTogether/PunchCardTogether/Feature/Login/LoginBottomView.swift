//
//  LoginBottomView.swift
//  PunchCardTogether
//
//  Created by zang qilong on 2022/7/31.
//

import SwiftUI

struct LoginBottomView: View {
    var body: some View {
        Image("login_logo")
            .resizable()
            .frame(width: 50, height: 50)
        Text("KAGO")
            .font(PCFont.puhui.font(size: 37, style: .heavy))
            .foregroundColor(.white)
        Text("RTE 2022")
            .font(PCFont.puhui.font(size: 13, style: .bold))
            .foregroundColor(.white)
            .padding(EdgeInsets(top: 24, leading: 0, bottom: 48, trailing: 0))
    }
}

struct LoginBottomView_Previews: PreviewProvider {
    static var previews: some View {
        LoginBottomView()
    }
}
