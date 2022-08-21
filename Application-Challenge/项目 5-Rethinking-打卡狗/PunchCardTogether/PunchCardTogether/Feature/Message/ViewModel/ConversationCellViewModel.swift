//
//  ConversationCellViewModel.swift
//  PunchCardTogether
//
//  Created by zang qilong on 2022/8/18.
//

import Foundation
import Combine

final class ConversationCellViewModel: ObservableObject {
    @Published var groupName = ""
    let groupId: String
    var cancellables = Set<AnyCancellable>()
    
    init(groupId: String) {
        self.groupId = groupId
        bind()
    }
    
    func bind() {
        MessageCenter.shared.groupInfo(groupId: groupId)
            .sink { error in
                
            } receiveValue: { group in
                guard self.groupName != group.groupName else {
                    return
                }
                self.groupName = group.groupName ?? "打卡群"
            }
            .store(in: &cancellables)
    }
}
