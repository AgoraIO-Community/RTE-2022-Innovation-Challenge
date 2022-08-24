//
//  MessageCenter+RxSwift.swift
//  PunchCardTogether
//
//  Created by zang qilong on 2022/8/20.
//

import Foundation
import RxSwift
import HyphenateChat
import Defaults

extension Reactive where Base == MessageCenter {
    func conversationList() -> Observable<[EMConversation]> {
        guard let chatManager = EMClient.shared().chatManager else {
            return .empty()
        }
        return Observable.create { observer in
            chatManager.getConversationsFromServer {
                list, error in
                if error != nil {
                    observer.onNext([])
                }
                if let list = list {
                    observer.onNext(list)
                }
                observer.onCompleted()
                
            }
            return Disposables.create()
        }
    }
    
    func groupName(id: String) -> Observable<String?> {
        guard let groupManager = EMClient.shared().groupManager else {
            return .empty()
        }
        return Observable.create { observer in groupManager.getGroupSpecificationFromServer(withId: id) { group, error in
            observer.onNext(group?.groupName)
        }
            return Disposables.create()
        }
    }
    
    func fetchMessages(conversation: EMConversation) -> Observable<[EMChatMessage]> {
        return Observable.create { observer in
            conversation.loadMessagesStart(fromId: nil, count: 20, searchDirection: .up) { messages, error in
                if let list = messages {
                    observer.onNext(list)
                } else {
                    observer.onNext([])
                }
                observer.onCompleted()
            }
            return Disposables.create()
        }
    }
    
    func sendText(conversationId: String, text: String) -> Observable<EMChatMessage?> {
        return Observable.create { observer in
            guard let manager = EMClient.shared().chatManager else {
                observer.onNext(nil)
                return Disposables.create()
            }
            let textBody = EMTextMessageBody(text: text)
            let userInfo = Defaults[.loginUser]?.userInfo()
            let message = EMChatMessage(conversationID: conversationId, body: textBody, ext: userInfo)
            message.chatType = .groupChat
            manager.send(message, progress: nil) { message, error in
                if let message = message {
                    observer.onNext(message)
                } else {
                    observer.onNext(nil)
                }
                observer.onCompleted()
            }
            return Disposables.create()
        }
    }
    
    func sendImage(conversationId: String, imageData: Data) -> Observable<EMChatMessage?> {
        return Observable.create { observer in
            guard let manager = EMClient.shared().chatManager else {
                observer.onNext(nil)
                return Disposables.create()
            }
            let imageBody = EMImageMessageBody(data: imageData, displayName: "")
            let userInfo = Defaults[.loginUser]?.userInfo()
            let message = EMChatMessage(conversationID: conversationId, body: imageBody, ext: userInfo)
            message.chatType = .groupChat
            manager.send(message, progress: nil) { message, error in
                if let message = message {
                    observer.onNext(message)
                } else {
                    observer.onNext(nil)
                }
                observer.onCompleted()
            }
            return Disposables.create()
        }
    }
    
    func joinGroup(groupId: String) -> Observable<Bool> {
        return Observable.create { observers in
            guard let groupManager = EMClient.shared().groupManager else {
                observers.onNext(false)
                return Disposables.create()
            }
            groupManager.joinPublicGroup(groupId, completion: { group, error in
                if group != nil {
                    observers.onNext(true)
                } else {
                    observers.onNext(false)
                }
                observers.onCompleted()
            })
            return Disposables.create()
        }
    }
}
