//
//  CreateGroupViewModel.swift
//  PunchCardTogether
//
//  Created by zang qilong on 2022/8/18.
//

import Foundation
import Combine
import HyphenateChat
import Moya

final class CreateGroupViewModel: ObservableObject {
    
    func createGroup(title: String) -> AnyPublisher<Bool, Never> {
        
        return MessageCenter.shared.createGroup(title: title, description: "")
            .flatMap { group -> AnyPublisher<Response, ChatError> in
                provider.requestPublisher(.createRoom(roomName: title, roomId: group.groupId))
                    .mapError { _ in
                        return ChatError.createGroupFailed
                    }
                    .eraseToAnyPublisher()
                
            }
            .tryMap({ response in
                return try JSONDecoder().decode(ChatGroupWarpper.self, from: response.data)
            })
            .eraseToAnyPublisher()
            .mapError({ error in
                ChatError.decodeModelFailed
            })
            .flatMap({ wrapper -> AnyPublisher<EMChatMessage, ChatError> in
                return MessageCenter.shared.sendText(conversationId: "\(wrapper.data.id)", text: "欢迎来到\(wrapper.data.name)~")
                    .eraseToAnyPublisher()
            })
            .map { message in
                return true
            }
            .replaceError(with: false)
            .eraseToAnyPublisher()
    }
}
