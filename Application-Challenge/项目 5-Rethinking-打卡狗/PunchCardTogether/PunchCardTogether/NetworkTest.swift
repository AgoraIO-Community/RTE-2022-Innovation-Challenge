//
//  NetworkTest.swift
//  PunchCardTogether
//
//  Created by zang qilong on 2022/8/12.
//

import Foundation
import Combine

struct NetworkResponse: Codable {
    let msg: String
    let code: Int
}

final class NetworkTest: ObservableObject {
    var cancellables = Set<AnyCancellable>()
    func testRegister() {
        provider.requestPublisher(KagoAPI.register(account: "18611693632", password: "12345zql"))
            .sink { error in
                debugPrint("error is \(error)")
            } receiveValue: { response in
                debugPrint(response)
            }
            .store(in: &cancellables)
    }
    
    func testLogin() {
        provider.requestPublisher(KagoAPI.login(account: "18611693632", password: "12345zql"))
            .map(NetworkResponse.self)
            .sink { error in
                debugPrint("error is \(error)")
            } receiveValue: { network in
                debugPrint(network)
            }
            .store(in: &cancellables)
    }
    
    func testCreateRtcToken() {
        provider.requestPublisher(KagoAPI.createRtcToken(rooId: "teset"))
            .map(NetworkResponse.self)
            .sink { error in
                debugPrint("error is \(error)")
            } receiveValue: { network in
                debugPrint(network)
            }
            .store(in: &cancellables)
    }
}
