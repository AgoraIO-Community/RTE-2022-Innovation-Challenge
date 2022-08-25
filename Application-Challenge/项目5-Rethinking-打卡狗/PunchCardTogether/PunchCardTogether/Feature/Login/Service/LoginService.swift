//
//  LoginService.swift
//  PunchCardTogether
//
//  Created by zang qilong on 2022/8/13.
//

import Foundation
import Moya
import Combine
import Defaults

final class LoginService: ObservableObject {
    @Published var loginSuccess: Bool = false
    var cancellables = Set<AnyCancellable>()
    
    func login(account: String, password: String) {
        provider.requestPublisher(.login(account: account, password: password))
            .map(UserWrapper.self)
            .sink { error in
                
            } receiveValue: { [weak self] userWrapper in
                guard let self = self else { return }
                self.loginSuccess = true
                Defaults[.loginUser] = userWrapper.data
            }
            .store(in: &cancellables)

    }
}
