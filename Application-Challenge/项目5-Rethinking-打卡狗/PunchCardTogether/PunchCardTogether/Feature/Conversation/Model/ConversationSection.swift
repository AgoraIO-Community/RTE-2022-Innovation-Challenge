//
//  ConversationSection.swift
//  PunchCardTogether
//
//  Created by zang qilong on 2022/8/20.
//

import Foundation
import HyphenateChat
import RxDataSources

struct ConversationItem {
    var conversation: EMConversation
    var name: String = ""
}

struct ConversationSection  {
    var items: [ConversationItem]
}

extension ConversationSection: SectionModelType {
    init(original: ConversationSection, items: [ConversationItem]) {
        self = original
        self.items = items
    }
    
    typealias Item = ConversationItem
}
