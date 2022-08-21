//
//  ConversationViewController.swift
//  PunchCardTogether
//
//  Created by zang qilong on 2022/8/20.
//

import Foundation
import UIKit
import ReactorKit
import SnapKit
import Defaults
import RxViewController
import RxDataSources
import SwiftUI
import SVProgressHUD

final class ConversationViewController: UIViewController, ReactorKit.View {
    var disposeBag: DisposeBag = DisposeBag()
    private lazy var tableView: UITableView = {
        let instance = UITableView(frame: .zero, style: .plain)
        instance.separatorStyle = .none
        instance.backgroundColor = UIColor(rgb: 0xf5f5f5)
        instance.register(cellType: ConversationTableViewCell.self)
        return instance
    }()
    private lazy var titleView: UIImageView = {
       let instance = UIImageView(image: UIImage(named: "titleview_icon"))
        instance.sizeToFit()
        return instance
    }()
    private lazy var dataSource: RxTableViewSectionedReloadDataSource<ConversationSection> = {
        return RxTableViewSectionedReloadDataSource<ConversationSection> { [weak self] source, tableView, indexPath, item in
            guard let reactor = self?.reactor else { return UITableViewCell() }
            let cell = tableView.dequeueReusableCell(for: indexPath, cellType: ConversationTableViewCell.self)
            cell.rx.shouldUpdateGroupName
                .map {
                    Reactor.Action.updateConversation(conversationId: $0)
                }
                .bind(to: reactor.action)
                .disposed(by: cell.disposeBag)
            cell.updateCell(item: item)
            return cell
        }
    }()
    private let joinGroupSubject = PublishSubject<String>()
    
    init() {
        super.init(nibName: nil, bundle: nil)
        self.reactor = ConversationReactor()
    }
    
    required init?(coder: NSCoder) {
        fatalError("init(coder:) has not been implemented")
    }
    
    override func viewDidLoad() {
        super.viewDidLoad()
        buildLayout()
    }
    
    func buildLayout() {
        navigationItem.titleView = self.titleView
        navigationItem.rightBarButtonItem = UIBarButtonItem(image: UIImage(named: "menu"), landscapeImagePhone: nil, style: .plain, target: self, action: #selector(handleMenu))
        view.backgroundColor = UIColor(rgb: 0xf5f5f5)
        view.addSubview(tableView)
        tableView.snp.makeConstraints { make in
            make.edges.equalToSuperview()
        }
    }
    
    @objc func handleMenu() {
        let alert = UIAlertController(title: nil, message: nil, preferredStyle: .actionSheet)
        alert.addAction(UIAlertAction(title: "创建群组", style: .default, handler: { _ in
            self.present(UIHostingController(rootView: TemplateView()), animated: true)
        }))
        alert.addAction(UIAlertAction(title: "加入群组", style: .default, handler: { _ in
            self.handleJoin()
        }))
        alert.addAction(UIAlertAction(title: "取消", style: .cancel))
        present(alert, animated: true)
    }
    
    @objc func handleJoin() {
        let alert = UIAlertController(title: "输入加入的群组 id", message: nil, preferredStyle: .alert)

        //2. Add the text field. You can configure it however you need.
        alert.addTextField { (textField) in
            textField.placeholder = "输入群组 id"
        }

        // 3. Grab the value from the text field, and print it when the user clicks OK.
        alert.addAction(UIAlertAction(title: "确定", style: .default, handler: { [weak alert] (_) in
            if let text = alert?.textFields![0].text, !text.isEmpty {
                self.joinGroupSubject.onNext(text)
            }
        }))
        alert.addAction(UIAlertAction(title: "取消", style: .cancel))
        // 4. Present the alert.
        self.present(alert, animated: true, completion: nil)
    }
    
    private func joinGroup(groupId: String) {
        
    }
    
    func bind(reactor: ConversationReactor) {
        rx.viewDidLoad
            .map {
                Reactor.Action.refreshConversations
            }
            .bind(to: reactor.action)
            .disposed(by: disposeBag)
        
        NotificationCenter.default.rx.notification(AppNotification.userStatusDidModified.notificationKey)
            .filter {
                _ in
                Defaults[.loginUser] != nil
            }
            .map {
                _ in
                Reactor.Action.refreshConversations
            }
            .bind(to: reactor.action)
            .disposed(by: disposeBag)
        
        reactor.state
            .map(\.sections)
            .bind(to: tableView.rx.items(dataSource: dataSource))
            .disposed(by: disposeBag)
        
        MessageCenter.shared.conversationUpdates
            .filter {
                !$0.isEmpty
            }
            .map {
                Reactor.Action.updateConversations($0)
            }
            .bind(to: reactor.action)
            .disposed(by: disposeBag)
        
        tableView.rx.modelSelected(ConversationItem.self)
            .subscribe(onNext: {
                [weak self] item in
                self?.navigationController?.pushViewController(ChatViewController(conversation: item.conversation, groupName: item.name), animated: true)
            })
            .disposed(by: disposeBag)
        
        joinGroupSubject.asObservable()
            .filter {
                !$0.isEmpty
            }
            .flatMap { groupId -> Observable<String> in
                return provider.rx.request(.joinRoom(roomId: groupId))
                    .asObservable()
                    .map(BaseResponse.self)
                    .map {
                        $0.code == 0
                    }
                    .flatMap { _ -> Observable<String> in
                        return MessageCenter.shared.rx.joinGroup(groupId: groupId)
                            .flatMap { _ in
                                return Observable<String>.just(groupId)
                            }
                    }
            }
            .flatMap { groupId in
                return MessageCenter.shared.rx.sendText(conversationId: groupId, text: "hello，很高兴加入你们")
            }
            .catchAndReturn(nil)
            .subscribe(onNext: {
                message in
                if message != nil {
                    SVProgressHUD.showSuccess(withStatus: "加入成功")
                } else {
                    SVProgressHUD.showError(withStatus: "加入失败")
                }
            })
            .disposed(by: disposeBag)
            
    }
}
