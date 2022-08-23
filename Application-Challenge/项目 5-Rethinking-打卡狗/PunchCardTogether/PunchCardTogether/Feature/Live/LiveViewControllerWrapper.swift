//
//  LiveViewControllerWrapper.swift
//  PunchCardTogether
//
//  Created by liaoyp on 2022/8/19.
//

import Foundation
import SwiftUI

struct LiveViewControllerWrapper: UIViewControllerRepresentable {
    
    func makeUIViewController(context: Context) -> some UIViewController {
        let vc =  LiveViewController()
        vc.roomName = "test"
        return vc
    }
    
    func updateUIViewController(_ uiViewController: UIViewControllerType, context: Context) {
       debugPrint("updateUIViewController")
    }
    
}
struct ContentView: View{
    var body: some View {
        LiveViewControllerWrapper()
    }
}

struct ContentView_Previews: PreviewProvider {
    static var previews: some View {
        ContentView()
    }
}

