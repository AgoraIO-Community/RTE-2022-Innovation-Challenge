//
//  MessageCenter+Combine.swift
//  PunchCardTogether
//
//  Created by zang qilong on 2022/8/21.
//

import Foundation
import Combine
import HyphenateChat

extension MessageCenter {
    func loginPublisher(user: User) -> Future<Bool, Never> {
        return Future { promise in
            EMClient.shared().login(withUsername: user.account, password: user.password) { result, error in
                if error == nil {
                    promise(.success(true))
                } else {
                    promise(.success(false))
                }
            }
        }
    }
    
    func conversationsFromServer() -> Future<[EMConversation], ChatError> {
        return Future { promise in
            guard let manager = EMClient.shared().chatManager else {
                promise(.failure(ChatError.chatManageNil))
                return
            }
            manager.getConversationsFromServer { conversations, error in
                if let list = conversations {
                    promise(.success(list))
                } else {
                    let description = error?.description ?? "get conversations from server failed"
                    promise(.failure(.other(description: description)))
                }
            }
        }
    }
    
    func messages(conversation: EMConversation) -> Future<[EMChatMessage], Never> {
        return Future { promise in
            conversation.loadMessagesStart(fromId: nil, count: 20, searchDirection: .down) { messages, error in
                promise(.success(messages ?? []))
            }
        }
    }
    
    func sendText(conversationId: String, text: String) -> Future<EMChatMessage, ChatError> {
        return Future { promise in
            guard let manager = EMClient.shared().chatManager else {
                promise(.failure(ChatError.chatManageNil))
                return
            }
            let textBody = EMTextMessageBody(text: text)
            let userInfo = self.user?.userInfo()
            let message = EMChatMessage(conversationID: conversationId, body: textBody, ext: userInfo)
            manager.send(message, progress: nil) { message, error in
                if let message = message {
                    promise(.success(message))
                } else {
                    let description = error?.description ?? "send Text failed"
                    promise(.failure(ChatError.other(description: description)))
                }
            }
        }
    }
    
    func sendImage(conversationId: String, imageData: Data) -> Future<EMChatMessage, ChatError> {
        return Future { promise in
            guard let manager = EMClient.shared().chatManager else {
                promise(.failure(ChatError.chatManageNil))
                return
            }
            let textBody = EMImageMessageBody(data: imageData, displayName: "")
            let userInfo = self.user?.userInfo()
            let message = EMChatMessage(conversationID: conversationId, body: textBody, ext: userInfo)
            manager.send(message, progress: nil) { message, error in
                if let message = message {
                    promise(.success(message))
                } else {
                    let description = error?.description ?? "send image failed"
                    promise(.failure(ChatError.other(description: description)))
                }
            }
        }
    }
    
    func joinGroup(groupId: String) -> Future<EMGroup, ChatError> {
        return Future { promise in
            EMClient.shared().groupManager?.joinPublicGroup(groupId, completion: { group, error in
                if let group = group {
                    promise(.success(group))
                } else {
                    promise(.failure(.joinGroupFailed))
                }
            })
        }
    }
    
    func createGroup(title: String, description: String) -> Future<EMGroup, ChatError> {
        return Future { promise in
            guard let manager = EMClient.shared().groupManager else {
                promise(.failure(.createGroupFailed))
                return
            }
            let options = EMGroupOptions()
            options.maxUsers = 8
            options.isInviteNeedConfirm = true
            options.style = .publicOpenJoin
            manager.createGroup(withSubject: title, description: "welcome", invitees: nil, message: "欢迎来到打卡群", setting: options, completion: {
                group, error in
                if let group = group {
                    promise(.success(group))
                } else {
                    promise(.failure(.createGroupFailed))
                }
            })
        }
    }
    
    func groupInfo(groupId: String) -> Future<EMGroup, ChatError> {
        return Future { promise in
            EMClient.shared().groupManager?.getGroupSpecificationFromServer(withId: groupId, fetchMembers: false, completion: { group, error in
                if let group = group {
                    promise(.success(group))
                } else {
                    promise(.failure(.getGroupInfoFailed))
                }
            })
        }
    }
}
