//
//  Login.swift
//  PunchCardTogether
//
//  Created by zang qilong on 2022/7/31.
//

import SwiftUI
import Defaults
import Combine
import ToastSwiftUI
import Toast
import Moya


enum LoginType {
    case login
    case register
    
    var title: String {
        switch self {
        case .login:
            return "登录"
        case .register:
            return "注册"
        }
    }
}

struct Login: View {
    @State var type = LoginType.login
    @State var account: String = ""
    @State var password: String = ""
    @State var confirmPassword: String = ""
    @State var selectedTag = 0
    @State var showLoading = false
    @State var showAlert = false
    @State var pushToAvatar = false
    @Environment(\.presentationMode) var presentationMode
    @State var cancellables = Set<AnyCancellable>()
    @State private var isPresentingToast = false
    @State private var toastText = ""
    @State var toastStatus = ToastView.Icon.loading
    @Namespace var namespace
    var buttonEnable: Binding<Bool> {
        Binding<Bool> {
            switch type {
            case .login:
                return (!account.isEmpty && !password.isEmpty)
            case .register:
                return (!account.isEmpty && !password.isEmpty && !confirmPassword.isEmpty)
            }
        } set: { _ in
            
        }
        
    }
    
    var body: some View {
        NavigationView {
            LoginGradientView {
                NavigationLink(destination: SelectAvatarView(), isActive: $pushToAvatar) { EmptyView() }
                if showLoading {
                    ProgressView()
                        .progressViewStyle(.circular)
                }
                VStack(spacing: 0) {
                    HStack(spacing: 20) {
                        IndicatorButton(currentTag: $selectedTag, namespace: namespace, tag: 0, text: "登录") {
                            type = .login
                        }
                        
                        IndicatorButton(currentTag: $selectedTag, namespace: namespace, tag: 1, text: "注册") {
                            type = .register
                        }
                    }
                    HStack {
                        Text("手机号")
                            .font(.system(size: 16, weight: .medium))
                            .foregroundColor(.white)
                        TextField("", text: $account)
                            .foregroundColor(.white)
                    }
                    .padding(.horizontal, 32)
                    .padding(.vertical, 40)
                    Group {
                        HStack {
                            Text("密码")
                                .font(.system(size: 16, weight: .medium))
                                .foregroundColor(.white)
                            SecureField("", text: $password)
                                .foregroundColor(.white)
                        }
                        .padding(.horizontal, 32)
                        if type == .register {
                            HStack {
                                Text("确认密码")
                                    .font(.system(size: 16, weight: .medium))
                                    .foregroundColor(.white)
                                SecureField("", text: $confirmPassword)
                                    .foregroundColor(.white)
                            }
                            .padding(.horizontal, 32)
                        }
                    }
                    .padding(.bottom, 46)
                    loginButton()
                    Spacer()
                    LoginBottomView()
                }
                .alert("\(type.title)信息不完整", isPresented: $showAlert) {
                    Button("确定", role: .cancel) {
                        
                    }
                }
            }
            .toast(isPresenting: $isPresentingToast, message: toastText, icon: toastStatus)
            .navigationBarHidden(true)
        }
    }
    
    @ViewBuilder
    func loginButton() -> some View {
        LoginButton(enable: buttonEnable, title: type.title, action: {
            switch type {
            case .login:
                guard !password.isEmpty, !account.isEmpty else {
                    showAlert = true
                    return
                }
                toastStatus = .loading
                isPresentingToast = true

                provider.requestPublisher(.login(account: account, password: password))
                    .map(UserWrapper.self)
                    .sink { error in
                        debugPrint("login error is \(error)")
                        //TODO 展示服务器返回的错误信息
                        isPresentingToast = true
                        toastText = "登录失败"
                        toastStatus = .error
                    } receiveValue: { wrapper in
                        isPresentingToast = true
                        toastText = "登录成功"
                        toastStatus = .success
                        Defaults[.loginUser] = wrapper.data
                        NotificationCenter.default.post(name: AppNotification.userStatusDidModified.notificationKey, object: nil)
                    }
                    .store(in: &cancellables)
                
            case .register:
                guard !password.isEmpty, !account.isEmpty else {
                    showAlert = true
                    return
                }
                toastStatus = .loading
                isPresentingToast = true
 
                provider.requestPublisher(.register(account: account, password: password))
                    .map(UserWrapper.self)
                    .mapError({ error -> MoyaError in
                        debugPrint("error")
                        return error
                    })
                    .sink { error in
                        debugPrint("login error is \(error)")
                        //TODO 展示服务器返回的错误信息
                        isPresentingToast = true
                        toastText = "注册失败"
                        toastStatus = .error
                    } receiveValue: { wrapper in
                        isPresentingToast = true
                        toastText = "登录成功"
                        toastStatus = .success
                        Defaults[.loginUser] = wrapper.data
                        pushToAvatar = true
                    }
                    .store(in: &cancellables)
            }
        })
    }
}

struct IndicatorButton: View {
    @Binding var currentTag: Int
    let namespace: Namespace.ID
    let tag: Int
    let text: String
    let action: () -> Void
    var body: some View {
        VStack(spacing: 5) {
            Button {
                currentTag = tag
                action()
            } label: {
                Text(text)
                    .opacity(currentTag == tag ? 1.0 : 0.5)
                    .font(.system(size: 36, weight: .semibold))
                    .foregroundColor(.white)
                    .padding(.top, 40)
            }
            if currentTag == tag {
                Color.white
                    .frame(width: 19, height: 5)
                    .matchedGeometryEffect(id: "whiteIndicator", in: namespace)
            } else {
                Color.clear
                    .frame(width: 19, height: 5)
            }
        }
        .animation(.spring(), value: currentTag)
    }
}

struct Login_Previews: PreviewProvider {
    static var previews: some View {
        Login()
    }
}
