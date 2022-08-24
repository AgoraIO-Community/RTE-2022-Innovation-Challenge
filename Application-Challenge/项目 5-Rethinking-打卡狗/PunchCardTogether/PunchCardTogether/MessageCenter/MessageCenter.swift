//
//  MessageCenter.swift
//  PunchCardTogether
//
//  Created by zang qilong on 2022/7/26.
//

import Foundation
import HyphenateChat
import SwiftUI
import Defaults
import Combine
import RxSwift

/*
 APPKEY:1120220810133697#demo
 Client ID:YXA6UQNtLP8QTtW-eYZASiOPzg
 ClientSecret:YXA63uvCpJxsKKHv_jECqCHBNeLFxF0
 */

struct HyphenateConfig {
    static let appkey = "1120220810133697#demo"
}

enum UserInfoState {
    case downloading
    case user(EMUserInfo)
}

enum ChatError: Error {
    case chatManageNil
    case groupManageNil
    case createGroupFailed
    case joinGroupFailed
    case getGroupInfoFailed
    case decodeModelFailed
    case other(description: String)
}

final class MessageCenter: NSObject, ObservableObject {
    @Default(.loginUser) var user
    static let shared = MessageCenter()
    let conversationUpdates = PublishSubject<[EMConversation]>()
    let messageUpdates = PublishSubject<[EMChatMessage]>()
    
    override init() {
        super.init()
    }
    
    func initSDK() {
        debugPrint("prepare connect")
        let options = EMOptions(appkey: HyphenateConfig.appkey)
        options.apnsCertName = nil
        let error = EMClient.shared().initializeSDK(with: options)
        if let initError = error {
            debugPrint("init sdk error \(initError)")
        }
        EMClient.shared().add(self, delegateQueue: nil)
        EMClient.shared().chatManager?.add(self, delegateQueue: nil)
        EMClient.shared().groupManager?.add(self, delegateQueue: nil)
    }
    
    func logout() {
        EMClient.shared().logout(true)
    }
    
    func login(user: User) {
        debugPrint("login to em")
        let loginError = EMClient.shared().login(withUsername: user.account, password: user.password)
        if let error = loginError {
            debugPrint("login failed error is \(error.errorDescription)")
        }
    }
    
    func updateUserInfo(nickName: String, avatar: String, gender: Int) {
        guard let loginUser = user else {
            return
        }
        let userInfo = EMUserInfo()
        userInfo.userId = loginUser.account
        userInfo.nickname = nickName
        userInfo.avatarUrl = avatar
        userInfo.gender = gender
        EMClient.shared().userInfoManager?.updateOwn(userInfo, completion: { info, error in
            
        })
    }
    
    
    func userInfo(userId: String, completion:@escaping (EMUserInfo?) -> Void) {
        EMClient.shared().userInfoManager?.fetchUserInfo(byId: [userId], completion: { userDatas, error in
            print("user data is \(userDatas)")
            if let user = userDatas?[userId] as? EMUserInfo {
                completion(user)
            } else {
                completion(nil)
            }
        })
    }
}

extension MessageCenter: EMGroupManagerDelegate {
    
}

extension MessageCenter: EMClientDelegate {
    func connectionStateDidChange(_ aConnectionState: EMConnectionState) {
        debugPrint("connect state changed\(aConnectionState)")
    }
    
    func autoLoginDidCompleteWithError(_ aError: EMError?) {
        debugPrint("login error is \(aError)")
    }
}

extension MessageCenter: EMChatManagerDelegate {
    func conversationListDidUpdate(_ aConversationList: [EMConversation]) {
        debugPrint("conversation updated")
        conversationUpdates.onNext(aConversationList)
    }
    
    func messagesDidReceive(_ aMessages: [EMChatMessage]) {
        debugPrint("receive message")
        messageUpdates.onNext(aMessages)
    }
}

extension EMConversation {
    func loadLatestMessages() async -> [EMChatMessage] {
        await withCheckedContinuation({ continuation in
            loadMessagesStart(fromId: nil, count: 20, searchDirection: EMMessageSearchDirection.up) { messages, error in
                DispatchQueue.main.async {
                    if let list = messages {
                        continuation.resume(with: .success(list))
                    } else {
                        continuation.resume(with: .success([]))
                    }
                }
            }
        })
        
    }
}
