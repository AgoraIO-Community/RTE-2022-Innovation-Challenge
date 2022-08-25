//
//  AgoraKeyCenter.swift
//  PunchCardTogether
//
//  Created by liaoyp on 2022/8/21.
//

import Foundation

struct AgoraKeyCenter {
    static let AppId: String = "1e3b2f1e45e64ba2a61d398f37dafed9"
    
    // assign token to nil if you have not enabled app certificate
    static var Token: String? = "007eJxTYGjvP3ZxsrjfEnkNlR9mtusWXvv3Y03pFJ45J283dtw79vKDAoNhqnGSUZphqolpqplJUqJRoplhirGlRZqxeUpiWmqKJZssU3JbHnOylRczIyMDBIL4LAwWQMDAAAAWcyEB"
    
    /// update rtcToken
    static func updateToken(token:String?) {
        guard let rtcToken = token else {
            return
        }
        Token = rtcToken
    }
}
