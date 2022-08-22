//
//  InputProfileView.swift
//  PunchCardTogether
//
//  Created by zang qilong on 2022/7/31.
//

import SwiftUI
import Defaults

enum Gender: Int {
    case male = 1
    case female
}

struct InputProfileView: View {
    let imageName: String
    @Default(.loginUser) var user
    @State var nickName: String = ""
    @State var gender: Gender = .male
    @Environment(\.presentationMode) var presentationMode
    
    var enableButton: Binding<Bool> {
        return Binding<Bool> {
            !nickName.isEmpty
        } set: { _ in
            
        }

    }
    var body: some View {
        LoginGradientView {
            VStack {
                Text("您的信息")
                    .font(.system(size: 36, weight: .semibold))
                    .foregroundColor(.white)
                    .padding(.top, 40)
                Image(imageName)
                    .resizable()
                    .frame(width: 86, height: 86)
                    .scaledToFit()
                    .padding(.bottom, 27)
                LoginInputView(bindingText: $nickName, placeholder: "你的昵称")
                    .padding(.horizontal, 77)
                HStack(spacing: 32) {
                    Button {
                        gender = .male
                    } label: {
                        Image("male")
                            .frame(width: 83, height: 33)
                            .foregroundColor(selectedColor(gender: .male))
                            .overlay {
                                RoundedRectangle(cornerRadius: 5)
                                    .stroke(selectedColor(gender: .male), lineWidth: 1)
                            }
                    }
                    .tag(Gender.male)
                    
                    Button {
                        gender = .female
                    } label: {
                        Image("female")
                            .frame(width: 83, height: 33)
                            .foregroundColor(selectedColor(gender: .female))
                            .overlay {
                                RoundedRectangle(cornerRadius: 5)
                                    .stroke(selectedColor(gender: .female), lineWidth: 1)
                            }
                    }
                    .tag(Gender.female)
                }
                .padding(.top, 50)
                .padding(.bottom, 20)
                LoginButton(enable: enableButton, title: "更新") {
                    user?.nickName = nickName
                    user?.gender = gender.rawValue
                    user?.avatar = imageName
                    MessageCenter.shared.updateUserInfo(nickName: nickName, avatar: imageName, gender: gender.rawValue)
                    NotificationCenter.default.post(name: AppNotification.userStatusDidModified.notificationKey, object: nil)
                }
                Spacer()
                LoginBottomView()
            }
            
        }
        .navigationBarHidden(true)
    }
    
    func selectedColor(gender: Gender) -> Color {
        return self.gender == gender ? Color(hex6: 0xD4744A) : .white
    }
}

struct InputProfileView_Previews: PreviewProvider {
    static var previews: some View {
        InputProfileView(imageName: "avatar1")
    }
}
