//
//  CreateGroupView.swift
//  PunchCardTogether
//
//  Created by zang qilong on 2022/8/14.
//

import SwiftUI
import Combine
import ToastSwiftUI

enum GroupType {
    case name
    case count
    case time
    case type
    case money
    
    var item: GroupItem {
        switch self {
        case .name:
            return GroupItem(name: "群名", content: "打卡群")
        case .count:
            return GroupItem(name: "打卡次数", content: " 1")
        case .time:
            return GroupItem(name: "打卡时间", content: "06:00-24:00")
        case .type:
            return GroupItem(name: "打卡方式", content: "图片 & 短视频 & 直播")
        case .money:
            return GroupItem(name: "群押金", content: "10 元")
        }
    }
}

struct CreateGroupView: View {
    @Environment(\.presentationMode) var dismiss
    @StateObject var viewModel = CreateGroupViewModel()
    init() {
        UITableView.appearance().keyboardDismissMode = .onDrag
    }
    @State var groupName: String = "打卡群"
    @State var enable = true
    @State var cancellables = Set<AnyCancellable>()
    @State var showToast = false
    @State var toastMessage = ""
    @State var toastStatus = ToastView.Icon.loading
    @State var offset = CGFloat.zero
    var body: some View {
        ZStack {
            Color(hex6: 0xf5f5f5)
                .ignoresSafeArea()
            ObservableScrollView(scrollOffset: $offset) {_ in
                VStack(alignment: .leading, spacing: 0) {
                    Text("基础信息")
                        .foregroundColor(Color.black.opacity(0.5))
                        .padding(.leading, 30)
                        .padding(.bottom, 10)
                    InputGroupCell(inputText: $groupName, type: .name)
                    
                    Text("打卡规则")
                        .foregroundColor(Color.black.opacity(0.5))
                        .padding(.leading, 30)
                        .padding(.bottom, 10)
                        .padding(.top, 41)
                    GroupCell(type: .count)
                    GroupCell(type: .time)
                    GroupCell(type: .type)
                    
                    Text("押金")
                        .foregroundColor(Color.black.opacity(0.5))
                        .padding(.leading, 30)
                        .padding(.bottom, 10)
                        .padding(.top, 41)
                    GroupCell(type: .money)
                        .padding(.bottom, 50)
                    LoginButton(enable: $enable, title: "新建") {
                        guard !groupName.isEmpty else {
                            toastMessage = "打卡群名不能为空"
                            toastStatus = .error
                            showToast = true
                            return
                        }
                        toastStatus = .loading
                        toastMessage = ""
                        showToast = true
                        viewModel.createGroup(title: groupName)
                            .sink { _ in
                                
                            } receiveValue: { isSuccess in
                                if isSuccess {
                                    toastMessage = "创建成功"
                                    toastStatus = .success
                                    showToast = true
                                    dismiss.wrappedValue.dismiss()
                                } else {
                                    toastMessage = "创建失败"
                                    toastStatus = .error
                                    showToast = true
                                }
                            }
                            .store(in: &cancellables)
                    }
                    .padding(.bottom)
                }
            }
        }
        .onChange(of: offset, perform: { newValue in
            hideKeyboard()
        })
        .navigationTitle("加载模板")
        .toast(isPresenting: $showToast, message: toastMessage, icon: toastStatus)
    }
}

struct GroupItem {
    let name: String
    let content: String
}

struct InputGroupCell: View {
    @Binding var inputText: String
    @FocusState var isEditing: Bool
    let type: GroupType
    var body: some View {
        VStack {
            Divider()
            HStack {
                Text(type.item.name)
                    .padding(.vertical, 12)
                    .padding(.leading, 30)
                Spacer()
                TextField(type.item.content, text: $inputText)
                    .font(PCFont.puhui.font(size: 16, style: .medium))
                    .multilineTextAlignment(.trailing)
                    .frame(width: 100)
                    .focused($isEditing)
                Image("accessory")
                    .padding(.trailing, 30)
            }
            Divider()
        }
        .background(Color.white)
    }
    
    func resign() {
        isEditing = false
    }
}

struct GroupCell: View {
    let type: GroupType
    var body: some View {
        VStack {
            Divider()
            HStack {
                Text(type.item.name)
                    .padding(.vertical, 12)
                    .padding(.leading, 30)
                Spacer()
                Text(type.item.content)
                    .font(PCFont.puhui.font(size: 16, style: .medium))
                Image("accessory")
                    .padding(.trailing, 30)
            }
            Divider()
        }
        .background(Color.white)
    }
}

struct CreateGroupView_Previews: PreviewProvider {
    static var previews: some View {
        CreateGroupView()
    }
}

extension UIApplication {
    func endEditing() {
        sendAction(#selector(UIResponder.resignFirstResponder), to: nil, from: nil, for: nil)
    }
}

extension View {
    func hideKeyboard() {
        UIApplication.shared.endEditing()
    }
}
