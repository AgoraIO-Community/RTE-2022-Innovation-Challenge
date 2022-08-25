//
//  Command.swift
//  PunchCardTogether
//
//  Created by zang qilong on 2022/7/26.
//

import Foundation
import HyphenateChat

protocol Command {
    func execute()
}

struct HyphenateInitializeCommand: Command {
    func execute() {
        MessageCenter.shared.initSDK()
    }
}

struct CommandsFactory {
    static func build() -> [Command] {
        return [HyphenateInitializeCommand()]
    }
}
