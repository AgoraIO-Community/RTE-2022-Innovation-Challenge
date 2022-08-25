//
//  ConversationView.swift
//  PunchCardTogether
//
//  Created by zang qilong on 2022/8/12.
//

import SwiftUI
import HyphenateChat

struct ConversationView: View {
    @State var groups = [EMGroup]()
    @State var isPresent = false
    @StateObject var viewModel = ConversationViewModel()
    var body: some View {
        NavigationView {
            ScrollView(.vertical) {
                LazyVStack {
                    ForEach(viewModel.conversationlist, id:\.self) {
                        conversation in
                        NavigationLink {
                            let chatViewModel = ChatViewModel(conversation: conversation)
                            ChatView()
                                .environmentObject(chatViewModel)
                        } label: {
                            ConversationCell(conversation: conversation)
                                .environmentObject(ConversationCellViewModel(groupId: conversation.conversationId))
                        }
                    }
                }
                .padding(.top)
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
//                    TemplateView()
                    LiveRoomMainController();
                }
            }
        }
    }
}

struct ConversationView_Previews: PreviewProvider {
    static var previews: some View {
        ConversationView()
    }
}
