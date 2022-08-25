//
//  ConversationCell.swift
//  PunchCardTogether
//
//  Created by zang qilong on 2022/8/16.
//

import SwiftUI
import HyphenateChat

struct ConversationCell: View {
    let conversation: EMConversation
    let dateFormatter = DateFormatter()
    @EnvironmentObject var viewModel: ConversationCellViewModel
    
    var body: some View {
        HStack {
            Image("conversation1")
            VStack(alignment: .leading) {
                HStack {
                    Text(viewModel.groupName)
                        .font(PCFont.puhui.font(size: 21, style: .medium))
                        .foregroundColor(Color(hex6: 0x0A0E2F))
                    Spacer()
                    Text(time())
                        .font(PCFont.puhui.font(size: 14, style: .medium))
                        .foregroundColor(Color(hex6: 0x0A0E2F).opacity(0.3))
                }
                .padding(.bottom, 6)
                Text(messageContent())
                    .font(PCFont.puhui.font(size: 14, style: .medium))
                    .foregroundColor(Color(hex6: 0x0A0E2F).opacity(0.5))
            }
        }
        .padding(.horizontal, 21)
    }
    
    func time() -> String {
        dateFormatter.dateFormat = "HH:mm"
        if let localTime = conversation.latestMessage?.localTime {
            return dateFormatter.string(from: Date(timeIntervalSince1970: Double(localTime)/1000))
        }
        return dateFormatter.string(from: Date())
    }
    
    func messageContent() -> String {
        guard let latestMessage = conversation.latestMessage else {
            return " "
        }
        let unread = conversation.unreadMessagesCount > 0 ? "[\(conversation.unreadMessagesCount)条]" : ""
        if let textMessage = latestMessage.body as? EMTextMessageBody {
            return unread + textMessage.text
        }
        if let _ = latestMessage.body as? EMImageMessageBody {
            return unread + "图片"
        }
        return unread
    }
}
