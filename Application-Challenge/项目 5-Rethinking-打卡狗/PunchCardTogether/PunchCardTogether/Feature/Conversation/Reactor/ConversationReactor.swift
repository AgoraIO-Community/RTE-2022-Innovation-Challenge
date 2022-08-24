//
//  ConversationReactor.swift
//  PunchCardTogether
//
//  Created by zang qilong on 2022/8/20.
//

import Foundation
import ReactorKit
import Defaults
import HyphenateChat

final class ConversationReactor: Reactor {
    enum Action {
        case refreshConversations
        case updateConversations([EMConversation])
        case updateConversation(conversationId: String)
    }
    
    enum Mutation {
        case setConversations([ConversationItem])
        case updateConversation(conversationId: String, name: String)
    }
    
    struct State {
        var sections = [ConversationSection]()
        var conversations = [ConversationItem]()
    }
    
    var initialState: State = State()
    
    func mutate(action: Action) -> Observable<Mutation> {
        switch action {
        case .refreshConversations:
            return MessageCenter.shared.rx.conversationList()
                .flatMap { conversations -> Observable<Mutation> in
                    let withoutDuplicates = conversations.filterDuplicates()
                    let items = withoutDuplicates.map {
                        ConversationItem(conversation: $0)
                    }
                    return Observable<Mutation>.just(.setConversations(items))
                }
        case let .updateConversations(updatedlist):
            var currentlist = self.currentState.conversations
            for ele in updatedlist {
                if let targetIndex = currentlist.firstIndex(where: { item in
                    item.conversation.conversationId == ele.conversationId
                }) {
                    currentlist[targetIndex] = ConversationItem(conversation: ele, name: currentlist[targetIndex].name)
                } else {
                    currentlist.insert(ConversationItem(conversation: ele), at: 0)
                }
            }
            return .just(.setConversations(currentlist))
        case .updateConversation(let conversationId):
            return MessageCenter.shared.rx.groupName(id: conversationId)
                .compactMap { $0 }
                .flatMap { name in
                    return Observable<Mutation>.just(.updateConversation(conversationId: conversationId, name: name))
                }
        }
    }
    
    func reduce(state: State, mutation: Mutation) -> State {
        var state = state
        switch mutation {
        case .setConversations(let list):
            state.conversations = list
            state.sections = [ConversationSection(items: list)]
        case let .updateConversation(conversationId, name):
            if let index = state.conversations.firstIndex(where: { item in
                item.conversation.conversationId == conversationId
            }) {
                var item = state.conversations[index]
                item.name = name
                state.conversations[index] = item
                state.sections = [ConversationSection(items: state.conversations)]
            }
        }
        return state
    }
}

extension Array where Element: EMConversation {
    func filterDuplicates() -> Array<Element> {
        var result = [Element]()
        self.forEach { conversation in
            let exists = result.first(where: { ele in
                ele.conversationId == conversation.conversationId
            })
            if exists == nil {
                result.append(conversation)
            }
        }
        return result
    }
}
