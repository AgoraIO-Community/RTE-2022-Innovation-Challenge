//
//  ChatReactor.swift
//  PunchCardTogether
//
//  Created by zang qilong on 2022/8/20.
//

import UIKit
import ReactorKit
import HyphenateChat

class ChatReactor: Reactor {
    enum Action {
        case refreshMessages
        case appendMessages([EMChatMessage])
        case sendTextMessage(String)
        case sendImageMessage(UIImage)
        case refreshSignStaus
    }
    
    enum Mutation {
        case appendMessages([EMChatMessage])
        case appendMessage(EMChatMessage)
        case setKeyboardHide
        case afterReceiveMessages
        case setSignInStatus(Bool)
    }
    
    struct State {
        let conversation: EMConversation
        var messages = [ChatMessage]()
        var sections = [ChatMessageSection]()
        @Pulse var keyboardHide: Bool?
        @Pulse var indexPath: IndexPath?
        var signInStatus = false
    }
    var initialState: State
    
    init(conversation: EMConversation) {
        initialState = State(conversation: conversation)
    }
    
    func mutate(action: Action) -> Observable<Mutation> {
        switch action {
        case .refreshSignStaus:
            return provider.rx.request(.isSignInRoom(roomId: currentState.conversation.conversationId))
                .map(SignInResponse.self)
                .asObservable()
                .map(\.data)
                .catchAndReturn(false)
                .flatMap { status -> Observable<Mutation> in
                    return .just(.setSignInStatus(status))
                }
        case .refreshMessages:
            let refresh = MessageCenter.shared.rx.fetchMessages(conversation: currentState.conversation).flatMap { messages -> Observable<Mutation> in
                return .just(.appendMessages(messages))
            }
            let refreshSign = provider.rx.request(.isSignInRoom(roomId: currentState.conversation.conversationId))
                .map(SignInResponse.self)
                .asObservable()
                .map(\.data)
                .catchAndReturn(false)
                .flatMap { status -> Observable<Mutation> in
                    return .just(.setSignInStatus(status))
                }
            return Observable.concat([
                refreshSign,
                refresh,
                Observable<Mutation>.just(.afterReceiveMessages)
            ])
        case .appendMessages(let messegas):
            return Observable.concat([
                Observable<Mutation>.just(.appendMessages(messegas)),
                Observable<Mutation>.just(.afterReceiveMessages)
            ])
        case let .sendTextMessage(text):
            guard !text.isEmpty else {
                return .empty()
            }
            let sendMessage =  MessageCenter.shared.rx.sendText(conversationId: currentState.conversation.conversationId, text: text)
                .compactMap { $0 }
                .flatMap { message in
                    return Observable<Mutation>.just(.appendMessage(message))
                }
            let hideKeyboard = Observable<Mutation>.just(.setKeyboardHide)
            let scroll = Observable<Mutation>.just(.afterReceiveMessages)
            return Observable.concat([sendMessage, hideKeyboard, scroll])
        case let .sendImageMessage(image):
            guard let data = image.jpegData(compressionQuality: 0.5) else {
                return .empty()
            }
            let refreshSign = provider.rx.request(.isSignInRoom(roomId: currentState.conversation.conversationId))
                .map(SignInResponse.self)
                .asObservable()
                .map(\.data)
                .catchAndReturn(false)
                .flatMap { status -> Observable<Mutation> in
                    return .just(.setSignInStatus(status))
                }
            let sendMessage = MessageCenter.shared.rx.sendImage(conversationId: currentState.conversation.conversationId, imageData: data)
                .compactMap { $0 }
                .flatMap { message in
                    return Observable<Mutation>.just(.appendMessage(message))
                }
            let sign = provider.rx.request(.signInRoom(roomId: currentState.conversation.conversationId, type: "1"))
                .asObservable()
                .map(BaseResponse.self)
                .map {
                    $0.code == 0
                }
                .catchAndReturn(false)
                .flatMap {_ in
                    sendMessage
                }
            let hideKeyboard = Observable<Mutation>.just(.setKeyboardHide)
            let scroll = Observable<Mutation>.just(.afterReceiveMessages)
            return Observable.concat([sign, hideKeyboard, scroll, refreshSign])
        }
    }
    
    func reduce(state: State, mutation: Mutation) -> State {
        var state = state
        switch mutation {
        case .setKeyboardHide:
            state.keyboardHide = true
        case .appendMessages(let messages):
            state.messages += messages.map { ChatMessage(message: $0)}
            state.sections = [ChatMessageSection(items: state.messages)]
        case .appendMessage(let message):
            state.messages.append(ChatMessage(message: message))
            state.sections = [ChatMessageSection(items: state.messages)]
        case .afterReceiveMessages:
            state.indexPath = IndexPath(row: state.messages.count - 1, section: 0)
        case .setSignInStatus(let status):
            state.signInStatus = status
        }
        return state
    }
}
