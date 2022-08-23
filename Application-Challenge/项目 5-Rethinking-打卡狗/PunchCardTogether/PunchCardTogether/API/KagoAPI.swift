//
//  KagoAPI.swift
//  PunchCardTogether
//
//  Created by zang qilong on 2022/8/6.
//

import Foundation
import Moya
import Defaults

private func JSONResponseDataFormatter(_ data: Data) -> String {
    do {
        let dataAsJSON = try JSONSerialization.jsonObject(with: data)
        let prettyData = try JSONSerialization.data(withJSONObject: dataAsJSON, options: .prettyPrinted)
        return String(data: prettyData, encoding: .utf8) ?? String(data: data, encoding: .utf8) ?? ""
    } catch {
        return String(data: data, encoding: .utf8) ?? ""
    }
}

private let networkLogger = NetworkLoggerPlugin(configuration: .init(formatter: .init(responseData: JSONResponseDataFormatter),
                                                                     logOptions: .verbose))

let provider = MoyaProvider<KagoAPI>(plugins: [networkLogger])
enum KagoAPI {
    case register(account: String, password: String)
    case login(account: String, password: String)
    case signInRoom(roomId: String, type: String)
    case isSignInRoom(roomId: String)
    case createRoom(roomName: String, roomId: String)
    case joinRoom(roomId: String)
    case createRtcToken(rooId: String)
}

extension KagoAPI: TargetType {
    var path: String {
        switch self {
        case .login:
            return "api/sign/in"
        case .register:
            return "api/sign/upByAccount"
        case .signInRoom:
            return "api/room/signin"
        case .isSignInRoom:
            return "api/room/isSign"
        case .createRoom:
            return "api/room/create"
        case .joinRoom:
            return "api/room/user/join"
        case .createRtcToken:
            return "api/rtm/create"
        }
    }
    
    var method: Moya.Method {
        switch self {
        case .isSignInRoom:
            return .get
        default:
            return .post
        }
    }
    
    var task: Moya.Task {
        switch self {
        case let .login(account, password):
            return .requestParameters(parameters: ["account": account, "password": password], encoding: URLEncoding.default)
        case let .register(account, password):
            return .requestParameters(parameters: ["account": account, "password": password], encoding: URLEncoding.default)
        case let .signInRoom(roomId, type):
            return .requestParameters(parameters: ["roomid": roomId, "type": type, "path": "path"], encoding: URLEncoding.default)
        case let .isSignInRoom(roomId):
            return .requestParameters(parameters: ["roomid": roomId], encoding: URLEncoding.default)
        case let .createRoom(roomName, roomId):
            return .requestParameters(parameters: ["name": roomName,"type": "1", "rule_count": "20", "rule_time": "0624", "rule_type": "1,2,3", "desc": "kago", "room_id": roomId], encoding: URLEncoding.default)
        case let .joinRoom(roomId):
            return .requestParameters(parameters: ["room_id": roomId], encoding: URLEncoding.default)
        case let .createRtcToken(rooId: roomId):
            return .requestParameters(parameters: ["id": roomId], encoding: URLEncoding.default)
        }
    }
    
    var headers: [String : String]? {
        if let token = Defaults[.loginUser]?.token {
            return ["Authorization" : "Bearer " + token]
        }
        return nil
    }
    
    var baseURL: URL {
        return URL(string: "https://dev.dakago.liaoquanzhi.cn")!
    }
}
