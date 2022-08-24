//
//  Settings.swift
//  PunchCardTogether
//
//  Created by liaoyp on 2022/8/21.
//

import Foundation
import AgoraRtcKit

struct Settings {
    var roomName: String?
    var role = AgoraClientRole.broadcaster
    var dimension = CGSize.defaultDimension()
    var frameRate = AgoraVideoFrameRate.defaultValue
}
