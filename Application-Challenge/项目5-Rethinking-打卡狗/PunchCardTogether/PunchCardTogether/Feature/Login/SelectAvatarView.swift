//
//  SelectAvatarView.swift
//  PunchCardTogether
//
//  Created by zang qilong on 2022/7/31.
//

import SwiftUI

struct SelectAvatarView: View {
    @State var avatarNames = (1...9).map { "avatar\($0)"}
    @State var selectedName = ""
    @State var pushToNext = false
    let columns = [
        GridItem(.adaptive(minimum: 86), spacing: 20)
    ]
    var body: some View {
        let buttonEnable = Binding {
            !selectedName.isEmpty
        } set: { _ in
            
        }

        LoginGradientView {
            NavigationLink(destination: InputProfileView(imageName: selectedName), isActive: $pushToNext) { EmptyView() }
            VStack {
                Text("选择您的头像")
                    .font(.system(size: 36, weight: .semibold))
                    .foregroundColor(.white)
                    .padding(.top, 40)
                LazyVGrid(columns: columns) {
                    ForEach(avatarNames, id:\.self) {
                        name in
                        Image(name)
                            .resizable()
                            .frame(width: 86, height: 86)
                            .scaledToFit()
                            .border(selectedName == name ? .white : .clear, width: 1.0)
                            .onTapGesture {
                                selectedName = name
                            }
                    }
                }
                .padding(.horizontal, 32)
                .padding(.bottom, 42)
                LoginButton(enable: buttonEnable, title: "下一步", action: {
                    pushToNext = true
                })
                Spacer()
                LoginBottomView()
            }
        }
        .navigationBarHidden(true)
    }
}

struct SelectAvatarView_Previews: PreviewProvider {
    static var previews: some View {
        SelectAvatarView()
    }
}
