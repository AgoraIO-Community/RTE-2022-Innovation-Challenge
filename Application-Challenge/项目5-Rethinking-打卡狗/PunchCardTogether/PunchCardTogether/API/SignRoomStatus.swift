//
//  SignRoomStatus.swift
//  PunchCardTogether
//
//  Created by zang qilong on 2022/8/19.
//

import Foundation

//struct SignRoomStatus: Codable {
//    let data: Bool
//}

struct SignInResponse: Codable {
    let msg: String
    let code: Int
    let data: Bool
}
