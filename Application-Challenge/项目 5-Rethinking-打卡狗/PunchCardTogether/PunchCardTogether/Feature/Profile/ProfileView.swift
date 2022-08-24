//
//  ProfileView.swift
//  PunchCardTogether
//
//  Created by zang qilong on 2022/8/13.
//

import SwiftUI
import Defaults

struct ProfileView: View {
    @ObservedObject var messageCenter = MessageCenter.shared
    @State var enable = true
    let history = (0...6).map { "history\($0)"}
    let badges1 = (1...3).map { "badge\($0)" }
    let badges2 = (4...6).map { "badge\($0)" }
    var body: some View {
        ZStack {
            Color(hex6: 0xf5f5f5)
                .ignoresSafeArea()
            ScrollView {
                LazyVStack(alignment: .leading,spacing: 0) {
                    HeaderProfileView()
                    Text("荣誉勋章")
                        .font(PCFont.puhui.font(size: 16, style: .medium))
                        .padding(.vertical, 24)
                        .padding(.leading, 25)
                    Group {
                        HStack {
                            ForEach(badges1,
                                    id:\.self) { name in
                                Spacer()
                                Image(name)
                                    .resizable()
                                    .scaledToFit()
                                    .frame(width: 80)
                                Spacer()
                            }
                        }
                        .padding(.bottom)
                        HStack {
                            ForEach(badges2, id:\.self) { name in
                                Spacer()
                                Image(name)
                                    .resizable()
                                    .scaledToFit()
                                    .frame(width: 70)
                                Spacer()
                            }
                        }
                    }
                    .padding(.vertical, 5)
                    .background(Color.white)
                    Text("打卡记录")
                        .font(PCFont.puhui.font(size: 16, style: .medium))
                        .padding(.vertical, 24)
                        .padding(.leading, 25)
                    ForEach(history, id:\.self) { name in
                        Image(name)
                            .resizable()
                            .frame(width: .infinity)
                            .scaledToFit()
                    }
                    LoginButton(enable: $enable, title: "退出登录") {
                        messageCenter.logout()
                        Defaults[.loginUser] = nil
                        NotificationCenter.default.post(name: AppNotification.userStatusDidModified.notificationKey, object: nil)
                    }
                    .padding(.top, 20)
                    .padding(.bottom)
                }
            }
        }
    }
}

struct ProfileView_Previews: PreviewProvider {
    static var previews: some View {
        ProfileView()
    }
}
