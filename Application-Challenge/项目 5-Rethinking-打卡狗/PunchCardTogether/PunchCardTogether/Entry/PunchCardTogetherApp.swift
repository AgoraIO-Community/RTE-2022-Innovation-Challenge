//
//  PunchCardTogetherApp.swift
//  PunchCardTogether
//
//  Created by zang qilong on 2022/7/24.
//
import SwiftUI
import Defaults
import RxSwift

enum AppNotification: String {
    case userStatusDidModified
    
    var notificationKey: Notification.Name {
        return Notification.Name.init(rawValue: self.rawValue)
    }
}


@UIApplicationMain
class AppDelegate: UIResponder, UIApplicationDelegate {
    
    lazy var window: UIWindow? = UIWindow(frame: UIScreen.main.bounds)
    var disposeBag = DisposeBag()
    func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {
        CommandsFactory.build().forEach { $0.execute() }
        AppNavigationBarStyle.standard.apply()

        if Defaults[.loginUser] == nil {
            window?.rootViewController = UIHostingController(rootView: Login())
        } else {
            window?.rootViewController = HomeTabBarViewController()
        }
        addObserver()
        if let user = Defaults[.loginUser] {
            MessageCenter.shared.login(user: user)
        }
        window?.overrideUserInterfaceStyle = .light
        window?.makeKeyAndVisible()
        return true
    }
    
    func addObserver() {
        NotificationCenter.default.rx.notification(AppNotification.userStatusDidModified.notificationKey)
            .subscribe(onNext: {
                [weak self] _ in
                if let user = Defaults[.loginUser] {
                    MessageCenter.shared.login(user: user)
                    self?.window?.rootViewController = HomeTabBarViewController()
                } else {
                    self?.window?.rootViewController = UIHostingController(rootView: Login())
                }
            })
            .disposed(by: disposeBag)
    }
}
    
enum AppNavigationBarStyle {
    case transparent
    case standard
    
    func apply() {
        let appearance = UINavigationBarAppearance()
        switch self {
        case .transparent:
            appearance.configureWithTransparentBackground()
            appearance.backgroundImage = UIImage()
            appearance.backgroundColor = .clear
            appearance.shadowImage = UIImage()
        case .standard:
            appearance.configureWithOpaqueBackground()
            appearance.backgroundColor = .white
            
            UITableView.appearance().keyboardDismissMode = .onDrag
            UITabBar.appearance().backgroundColor = .white
            UITabBar.appearance().isTranslucent = false
        }
        let itemButtonApperance = UIBarButtonItemAppearance()
        itemButtonApperance.normal.titleTextAttributes = [.foregroundColor: UIColor.clear, .font: UIFont.systemFont(ofSize: 0.1)]
        itemButtonApperance.highlighted.titleTextAttributes = [.foregroundColor: UIColor.clear, .font: UIFont.systemFont(ofSize: 0.1)]
        let backImage: UIImage = UIImage(named: "backImage")!
        appearance.backButtonAppearance = itemButtonApperance
        appearance.setBackIndicatorImage(backImage, transitionMaskImage: backImage)
        
        UINavigationBar.appearance().standardAppearance = appearance
        UINavigationBar.appearance().scrollEdgeAppearance = appearance
    }
}
