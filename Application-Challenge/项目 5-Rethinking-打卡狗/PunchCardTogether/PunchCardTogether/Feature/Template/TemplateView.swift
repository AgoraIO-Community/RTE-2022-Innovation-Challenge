//
//  SelectSceneView.swift
//  PunchCardTogether
//
//  Created by zang qilong on 2022/7/31.
//

import SwiftUI

private struct Constants {
    static let itemWidth = (UIScreen.main.bounds.width - 40)/2
}

struct TemplateView: View {
    @Environment(\.presentationMode) var dismiss
    let columns = [GridItem(.fixed(Constants.itemWidth)), GridItem(.fixed(Constants.itemWidth))]
    let images = (0...8).map { "template\($0)" }
    var body: some View {
        NavigationView {
            ZStack {
                Color(hex6: 0xf5f5f5)
                    .ignoresSafeArea()
                ScrollView(.vertical, showsIndicators: false) {
                    VStack(alignment: .leading) {
                        Text("选择场景")
                            .font(PCFont.puhui.font(size: 30, style: .medium))
                            .foregroundColor(Color(hex6: 0x76B4F6))
                        Text("多种打卡场景模板，快速开始吧")
                            .font(PCFont.puhui.font(size: 15, style: .medium))
                            .foregroundColor(Color(hex6: 0x76B4F6))
                            .padding(.bottom, 15)
                        LazyVGrid(columns: columns) {
                            ForEach(images, id:\.self) { name in
                                NavigationLink {
                                    CreateGroupView()
                                } label: {
                                    Image(name)
                                        .resizable()
                                        .scaledToFit()
                                        .frame(width: Constants.itemWidth, height: Constants.itemWidth)
                                }

                                    
                            }
                        }
                    }
                    .padding(.horizontal, 31)
                }
                
            }
            .navigationTitle("新建打卡群")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItemGroup(placement: .navigationBarLeading) {
                    Image(systemName: "xmark")
                        .onTapGesture {
                            dismiss.wrappedValue.dismiss()
                        }
                }
            }
            
        }
        
    }
}

struct SelectSceneView_Previews: PreviewProvider {
    static var previews: some View {
        TemplateView()
    }
}
