//
//  HomeTabBarViewController.swift
//  PunchCardTogether
//
//  Created by zang qilong on 2022/8/20.
//

import UIKit
import SwiftUI
import Defaults

class HomeTabBarViewController: UITabBarController {
    let conversationVC = UINavigationController(rootViewController: ConversationViewController())
    let findVC = UINavigationController(rootViewController: UIHostingController(rootView: FindView()))
    let profileVc = UIHostingController(rootView: ProfileView())
    init() {
        super.init(nibName: nil, bundle: nil)
        conversationVC.tabBarItem = UITabBarItem(title: HomeTab.kago.title, image: UIImage(named: HomeTab.kago.unselectedImage), selectedImage: UIImage(named: HomeTab.kago.selectedImage))
        findVC.tabBarItem = UITabBarItem(title: HomeTab.find.title, image: UIImage(named: HomeTab.find.unselectedImage), selectedImage: UIImage(named: HomeTab.find.selectedImage))
        profileVc.tabBarItem = UITabBarItem(title: HomeTab.me.title, image: UIImage(named: HomeTab.me.unselectedImage), selectedImage: UIImage(named: HomeTab.me.selectedImage))
        viewControllers = [conversationVC, findVC, profileVc]
    }
    
    required init?(coder: NSCoder) {
        fatalError("init(coder:) has not been implemented")
    }
    
    override func viewDidLoad() {
        super.viewDidLoad()
        view.backgroundColor = UIColor(rgb: 0xf5f5f5)
    }
    
    override func viewWillAppear(_ animated: Bool) {
        super.viewWillAppear(animated)
    }
    

    /*
    // MARK: - Navigation

    // In a storyboard-based application, you will often want to do a little preparation before navigation
    override func prepare(for segue: UIStoryboardSegue, sender: Any?) {
        // Get the new view controller using segue.destination.
        // Pass the selected object to the new view controller.
    }
    */

}
