//
//  User.swift
//  PunchCardTogether
//
//  Created by zang qilong on 2022/8/13.
//

import Foundation
import Defaults

struct UserWrapper: Codable {
    let msg: String
    let code: Int
    let data: User
}

struct BaseResponse: Codable {
    let msg: String
    let code: Int
}

struct UserBridge<Value: Codable>: DefaultsCodableBridge {}

struct User: Codable, Defaults.Serializable, Identifiable, Equatable {
    static let bridge = UserBridge<User>()
    let account: String
    var gender: Int?
    var avatar: String?
    let id: Int
    let updateTime: TimeInterval
    let easemobToken: String
    let token: String
    let rtcToken: String
    var nickName: String?
    let createTime: TimeInterval
    let password: String
    
    func userInfo() -> [String: Any] {
        var dict = [String: Any]()
        if let gender = gender {
            dict["gender"] = gender
        }
        if let avatar = avatar {
            dict["avatar"] = avatar
        }
        if let nickName = nickName {
            dict["nickname"] = nickName
        }
        return dict
    }
}
