//
//  ChatMessage.swift
//  PunchCardTogether
//
//  Created by zang qilong on 2022/8/20.
//

import Foundation
import HyphenateChat
import RxDataSources
import AVFoundation

struct MessageConstants {
    static let imageMaxSize = CGSize(width: UIScreen.main.bounds.width/2, height: UIScreen.main.bounds.width/2)
    static let textCellMaxWidth: CGFloat = 0.7 * UIScreen.main.bounds.width
    
    static func imageFitSize(imageSize: CGSize) -> CGSize {
        return AVMakeRect(aspectRatio: imageSize, insideRect: CGRect(origin: .zero, size: imageMaxSize)).size
    }
}

enum MessageDirection {
    case left
    case right
    
    var backgroundColor: UIColor {
        switch self {
        case .left:
            return UIColor(rgb: 0xE7E7E7)
        case .right:
            return UIColor(rgb: 0x0099FF)
        }
    }
    
    var textColor: UIColor {
        switch self {
        case .left:
            return .black
        case .right:
            return .white
        }
    }
    
    var signIcon: UIImage {
        switch self {
        case .left:
            return UIImage(named: "kago_signin_icon")!
        case .right:
            return UIImage(named: "kago_signin_icon_white")!
        }
    }
}

enum MessageStatus: Int, Equatable {
    case sending
    case success
    case failed
}

struct ChatMessage: Equatable {
    let message: EMChatMessage
    let status = MessageStatus.success
}

struct ChatMessageSection: Equatable {
    var items: [ChatMessage]
}

extension ChatMessageSection: SectionModelType {
    typealias Item = ChatMessage
    init(original: ChatMessageSection, items: [ChatMessage]) {
        self = original
        self.items = items
    }
}
