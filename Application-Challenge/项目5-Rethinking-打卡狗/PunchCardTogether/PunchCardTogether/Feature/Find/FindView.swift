//
//  Find.swift
//  PunchCardTogether
//
//  Created by zang qilong on 2022/8/13.
//

import SwiftUI
import GRDB

struct FindView: View {
    let cardWidth = (UIScreen.main.bounds.width - 21)/2
    @State var columns: [GridItem] = {
        let cardWidth = (UIScreen.main.bounds.width - 21)/2
        return [GridItem(.adaptive(minimum: cardWidth)), GridItem(.adaptive(minimum: cardWidth))]
    }()
    let images = (1...6).map { "find_default_image\($0)" }
    @State var isPresent = false
    var body: some View {
        ZStack {
            Color(hex6: 0xf5f5f5)
                .ignoresSafeArea()
            ScrollView(.vertical, showsIndicators: false) {
                VStack(alignment: .leading) {
                    Text("选择一个房间加入吧")
                        .font(PCFont.puhui.font(size: 30, style: .medium))
                        .foregroundColor(Color.black)
                    LazyVGrid(columns: columns) {
                        ForEach(images, id:\.self) { name in
                            Image(name)
                                .resizable()
                                .frame(width: cardWidth, height: cardWidth)
                                .scaledToFit()
                        }
                    }
                    Spacer()
                }
            }
            
        }
        .navigationBarTitleDisplayMode(.inline)
        .toolbar {
            ToolbarItem(placement: .principal) {
                Image("titleview_icon")
            }
            ToolbarItemGroup(placement: .navigationBarTrailing) {
                Image(systemName: "plus")
                    .onTapGesture {
                        isPresent = true
                    }
            }
        }
        .fullScreenCover(isPresented: $isPresent) {
            TemplateView()
        }
    }
}

struct Find_Previews: PreviewProvider {
    static var previews: some View {
        FindView()
    }
}
