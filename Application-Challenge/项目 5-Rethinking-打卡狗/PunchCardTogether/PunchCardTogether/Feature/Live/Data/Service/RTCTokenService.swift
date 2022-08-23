//
//  RTCTokenService.swift
//  PunchCardTogether
//
//  Created by liaoyp on 2022/8/23.
//

import Foundation
import Combine

struct Tokenrapper: Codable {
    let msg: String
    let code: Int
    let data: String?
}

class RtcTokenService : ObservableObject {
    @Published var updateSuccess: Bool = false
    
    var cancellables = Set<AnyCancellable>()
    
    func updateToken(roomId:String?) {
        
        provider.requestPublisher(KagoAPI.createRtcToken(rooId: roomId ?? "test"))
            .map(Tokenrapper.self)
            .sink { error in
                debugPrint("error is \(error)")
            } receiveValue: { network in
                debugPrint(network)
                guard let rtcToken = network.data else {
                    return
                }
                self.updateSuccess = true
                AgoraKeyCenter.updateToken(token: rtcToken)
            }
            .store(in: &cancellables)
    }
}
