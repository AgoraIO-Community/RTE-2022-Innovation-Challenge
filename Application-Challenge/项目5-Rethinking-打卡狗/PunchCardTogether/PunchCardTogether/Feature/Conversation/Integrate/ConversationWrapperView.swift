//
//  ConversationWrapperView.swift
//  PunchCardTogether
//
//  Created by zang qilong on 2022/8/20.
//

import Foundation
import SwiftUI

struct ConversationWrapperView: UIViewControllerRepresentable {
    func makeUIViewController(context: Context) -> some UIViewController {
        return UINavigationController(rootViewController:  ConversationViewController())
    }
    
    func updateUIViewController(_ uiViewController: UIViewControllerType, context: Context) {
        
    }
}
