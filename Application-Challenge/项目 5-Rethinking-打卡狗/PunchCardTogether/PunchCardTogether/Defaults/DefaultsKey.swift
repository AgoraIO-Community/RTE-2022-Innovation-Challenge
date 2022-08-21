//
//  DefaultsKey.swift
//  PunchCardTogether
//
//  Created by zang qilong on 2022/8/13.
//

import Foundation
import Defaults
import Alamofire

extension Defaults.Keys {
    static let loginUser = Key<User?>("loginUser", default: nil)
}
