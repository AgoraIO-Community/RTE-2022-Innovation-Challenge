//
//  HeaderProfileView.swift
//  PunchCardTogether
//
//  Created by zang qilong on 2022/8/14.
//

import SwiftUI
import Defaults

struct HeaderProfileView: View {
    @Default(.loginUser) var user
    var body: some View {
        ZStack {
            Color(hex6: 0xD4744A)
                .ignoresSafeArea()
            HStack {
                Image("avatar1")
                    .padding(.trailing, 20)
                VStack(alignment: .leading) {
                    Text(user?.account ?? "- -")
                        .font(PCFont.puhui.font(size: 23, style: .bold))
                        .foregroundColor(.white)
                    HStack {
                        UserRecordView(title: "完成打卡", value: "87")
                        Divider()
                            .frame(height: 34)
                        UserRecordView(title: "打卡群", value: "2")
                        Divider()
                            .frame(height: 34)
                        UserRecordView(title: "等级", value: "3")
                    }
                }
            }
            .padding(.bottom, 50)
            .padding(.top, 70)
        }
        
    }
}

struct UserRecordView: View {
    let title: String
    let value: String
    var body: some View {
        VStack {
            Text(title)
                .font(PCFont.puhui.font(size: 13, style: .medium))
                .foregroundColor(Color.white.opacity(0.5))
            Text(value)
                .font(PCFont.puhui.font(size: 21, style: .bold))
                .foregroundColor(Color.white)
        }
    }
}

struct HeaderProfileView_Previews: PreviewProvider {
    static var previews: some View {
        HeaderProfileView()
    }
}
