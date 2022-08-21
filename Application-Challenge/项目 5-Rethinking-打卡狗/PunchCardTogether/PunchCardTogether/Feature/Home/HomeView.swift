//
//  HomeView.swift
//  PunchCardTogether
//
//  Created by zang qilong on 2022/8/6.
//

import SwiftUI
import Defaults

enum HomeTab: Int {
    case kago
    case find
    case me
    
    var title: String {
        switch self {
        case .kago:
            return "KAGO"
        case .find:
            return "发现"
        case .me:
            return "我"
        }
    }
    
    var selectedImage: String {
        switch self {
        case .kago:
            return "tabbar_kago_selected"
        case .find:
            return "tabbar_find_selected"
        case .me:
            return "tabbar_me_selected"
        }
    }
    
    var unselectedImage: String {
        switch self {
        case .kago:
            return "tabbar_kago_not_selected"
        case .find:
            return "tabbar_find_not_selected"
        case .me:
            return "tabbar_me_not_selected"
        }
    }
}

extension Optional {
    var bool: Bool {
        return self == nil
    }
}

struct HomeView: View {
    @State var selectedTab = HomeTab.kago
    @Default(.loginUser) var loginUser
    @Environment(\.scenePhase) var scenePhase
    
    var presentLogin: Binding<Bool> {
        Binding {
            self.loginUser == nil
        } set: { _ in
            
        }
    }
    
    init() {
        UITabBar.appearance().tintColor = UIColor.black
    }
    
    var body: some View {
        TabView(selection: $selectedTab) {
            ConversationWrapperView()
                .tabItem {
                    Image(selectedTab == .kago ? HomeTab.kago.selectedImage : HomeTab.kago.unselectedImage)
                    Text("KAGO")
                        .font(PCFont.puhui.font(size: 12, style: .medium))
                        .foregroundColor(selectedTab == .kago ? .black : Color.black.opacity(0.5))
                }
                .tag(HomeTab.kago)
            FindView()
                .tabItem {
                    Image(selectedTab == .find ? HomeTab.find.selectedImage : HomeTab.find.unselectedImage)
                    Text("发现")
                        .font(PCFont.puhui.font(size: 12, style: .medium))
                        .foregroundColor(selectedTab == .find ? .black : Color.black.opacity(0.5))
                }
                .tag(HomeTab.find)
            ProfileView()
                .tabItem {
                    Image(selectedTab == .me ? HomeTab.me.selectedImage : HomeTab.me.unselectedImage)
                    Text("我")
                        .font(PCFont.puhui.font(size: 12, style: .medium))
                        .foregroundColor(selectedTab == .me ? .black : Color.black.opacity(0.5))
                }
                .tag(HomeTab.me)
        }
        .fullScreenCover(isPresented: presentLogin) {
            Login()
        }
        .onChange(of: loginUser) { newValue in
            if let user = newValue {
                MessageCenter.shared.login(user: user)
            }
        }
        .onAppear {
            if let user = loginUser {
                MessageCenter.shared.login(user: user)
                MessageCenter.shared.userInfo(userId: user.account) { info in
                    guard let userInfo = info else {
                        return
                    }
                    loginUser?.gender = userInfo.gender
                    loginUser?.avatar = userInfo.avatarUrl
                    loginUser?.nickName = userInfo.nickname
                }
            }
        }
    }
}

struct HomeView_Previews: PreviewProvider {
    static var previews: some View {
        HomeView()
    }
}
