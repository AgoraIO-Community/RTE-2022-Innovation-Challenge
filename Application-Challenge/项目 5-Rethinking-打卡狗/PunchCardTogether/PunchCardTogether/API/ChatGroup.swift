//
//  ChatGroup.swift
//  PunchCardTogether
//
//  Created by zang qilong on 2022/8/19.
//

import Foundation

struct ChatGroupWarpper: Codable {
    let msg: String
    let code: Int
    let data: ChatGroup
}

struct ChatGroup: Codable {
    let name: String
    let id: Int64
}
