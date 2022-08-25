//
//  ChatViewController.swift
//  PunchCardTogether
//
//  Created by zang qilong on 2022/8/20.
//

import UIKit
import ReactorKit
import RxDataSources
import HyphenateChat
import RxKeyboard
import RxCocoa
import SVProgressHUD

enum InputBarStatus: Equatable {
    case initial
    case checkView
    case keyboard(height: CGFloat)
    
    static func ==(lhs: InputBarStatus, rhs: InputBarStatus) -> Bool {
        switch (lhs, rhs) {
        case (.initial, .initial):
            return true
        case (.checkView, .checkView):
            return true
        case (.keyboard(let height1), .keyboard(let height2)):
            return height1 == height2
        default:
            return false
        }
    }
}

class ChatViewController: UIViewController, View {
    var disposeBag: DisposeBag = DisposeBag()
    private lazy var tableView: UITableView = {
        let instance = UITableView(frame: .zero, style: .plain)
        instance.separatorStyle = .none
        instance.backgroundView = UIImageView(image: UIImage(named: "classroom_bg"))
        instance.register(cellType: TextMessageTableViewCell.self)
        instance.register(cellType: ImageMessageTableViewCell.self)
        // instance.keyboardDismissMode = .onDrag
        return instance
    }()
    private let inputBar = InputBarView(frame: .zero)
    private var didBuildLayout = false
    private lazy var dataSource: RxTableViewSectionedReloadDataSource<ChatMessageSection> = {
        return RxTableViewSectionedReloadDataSource<ChatMessageSection> { source, tableView, indexPath, item in
            if item.message.body is EMTextMessageBody {
                let cell = tableView.dequeueReusableCell(for: indexPath, cellType: TextMessageTableViewCell.self)
                cell.updateCell(item: item)
                return cell
            }
            if item.message.body is EMImageMessageBody {
                let cell = tableView.dequeueReusableCell(for: indexPath, cellType: ImageMessageTableViewCell.self)
                cell.updateCell(item: item)
                return cell
            }
            return UITableViewCell()
        }
    }()
    private let checkView = CheckInView(frame: .zero)
    private let inputStatus = PublishSubject<InputBarStatus>()
    private let selectedImage = PublishSubject<UIImage>()
    private lazy var imagePicker: UIImagePickerController = {
       let picker = UIImagePickerController()
        picker.sourceType = .photoLibrary
        picker.allowsEditing = false
        picker.delegate = self
        return picker
    }()
    private let conversationId: String
    private let groupName: String
    
    init(conversation: EMConversation, groupName: String) {
        conversationId = conversation.conversationId
        self.groupName = groupName
        super.init(nibName: nil, bundle: nil)
        self.reactor = ChatReactor(conversation: conversation)
        hidesBottomBarWhenPushed = true
    }
    
    required init?(coder: NSCoder) {
        fatalError("init(coder:) has not been implemented")
    }
    
    override func viewDidLoad() {
        super.viewDidLoad()
        buildLayout()
        
        //提前获取最新直播间Token
        RtcTokenService().updateToken(roomId: self.conversationId)
    }
    
    override func viewWillAppear(_ animated: Bool) {
        super.viewWillAppear(animated)
        navigationController?.setNavigationBarHidden(false, animated: true)
    }
    
    override func viewDidLayoutSubviews() {
        super.viewDidLayoutSubviews()
        tableView.contentInset.bottom = inputBar.frame.height + 20
    }
    
    func buildLayout() {
        defer {
            didBuildLayout = true
        }
        navigationItem.title = groupName
        navigationItem.rightBarButtonItem = UIBarButtonItem(image: UIImage(named: "menu"), landscapeImagePhone: nil, style: .plain, target: self, action: #selector(handleMenu))
        view.backgroundColor = .white
        view.addSubview(tableView)
        view.addSubview(inputBar)
        view.addSubview(checkView)
        
        tableView.snp.makeConstraints { make in
            make.top.left.right.equalToSuperview()
            make.bottom.equalTo(view.safeAreaLayoutGuide.snp.bottom)
        }
        
        checkView.alpha = 0
        checkView.snp.makeConstraints { make in
            make.left.right.equalToSuperview()
            make.top.equalTo(view.safeAreaLayoutGuide.snp.bottom)
        }
        
        inputBar.snp.makeConstraints { make in
            make.left.right.equalToSuperview()
            make.bottom.equalTo(view.safeAreaLayoutGuide.snp.bottom)
        }
    }
    
    @objc func handleMenu() {
        let alert = UIAlertController(title: nil, message: nil, preferredStyle: .actionSheet)
        alert.addAction(UIAlertAction(title: "分享群组", style: .default, handler: { _ in
            UIPasteboard.general.string = self.conversationId
            SVProgressHUD.showSuccess(withStatus: "群组id已复制到剪切板，去分享给朋友吧")
        }))
        alert.addAction(UIAlertAction(title: "取消", style: .cancel))
        present(alert, animated: true)
    }
    
    func bind(reactor: ChatReactor) {
        reactor.pulse(\.$indexPath)
            .compactMap { $0 }
            .subscribe(onNext: {
                [weak self] indexPath in
                self?.tableView.scrollToRow(at: indexPath, at: .bottom, animated: false)
            })
            .disposed(by: disposeBag)
        
        reactor.state
            .map(\.signInStatus)
            .distinctUntilChanged()
            .bind(to: inputBar.rx.signButtonEnabled)
            .disposed(by: disposeBag)
        
        rx.viewDidLoad
            .map {
                Reactor.Action.refreshMessages
            }
            .bind(to: reactor.action)
            .disposed(by: disposeBag)
        
        MessageCenter.shared.messageUpdates
            .map {
                [weak self] in
                $0.filter { message in
                    message.conversationId == self?.conversationId
                }
            }
            .debug("receive messages")
            .map {
                Reactor.Action.appendMessages($0)
            }
            .bind(to: reactor.action)
            .disposed(by: disposeBag)
        
        reactor.state
            .map(\.sections)
            .distinctUntilChanged()
            .bind(to: tableView.rx.items(dataSource: dataSource))
            .disposed(by: disposeBag)
        
        inputBar.rx.returnKeyDidClick
            .map {
                Reactor.Action.sendTextMessage($0)
            }
            .bind(to: reactor.action)
            .disposed(by: disposeBag)
        
        reactor.pulse(\.$keyboardHide)
            .compactMap { $0 }
            .subscribe(onNext: {
                [weak self] _ in
                self?.inputBar.resignSelf()
                self?.inputStatus.onNext(.initial)
            })
            .disposed(by: disposeBag)
        
        tableView.rx.didScroll
            .subscribe(onNext: {
                [weak self] in
                self?.inputStatus.onNext(.initial)
            })
            .disposed(by: disposeBag)
        
        inputBar.rx.signLongPress
            .subscribe(onNext: {
              _ in
                self.inputStatus.onNext(.checkView)
            })
            .disposed(by: disposeBag)
        
        RxKeyboard.instance.visibleHeight
            .scan(1, accumulator: { aggregateValue, newValue in
                newValue == 0 ? -aggregateValue : newValue
            })
            .asObservable()
            .filter {
                [weak self] tuple in
                guard let self = self else { return false}
                return self.didBuildLayout
            }
            .subscribe(onNext: { [weak self] keyboardHeight in
                guard let `self` = self else { return }
                if keyboardHeight > 0 {
                    self.inputStatus.onNext(.keyboard(height: keyboardHeight))
                }
            })
            .disposed(by: disposeBag)
        
        inputBar.rx.plusButtonClick
            .map {
                InputBarStatus.checkView
            }
            .bind(to: inputStatus)
            .disposed(by: disposeBag)
        
        inputStatus.asObservable()
            .distinctUntilChanged()
            .subscribe(onNext: {
                [weak self] status in
                guard let self = self else { return }
                switch status {
                case .initial:
                    self.checkView.alpha = 0
                    self.checkView.snp.remakeConstraints { make in
                        make.left.right.equalToSuperview()
                        make.top.equalTo(self.view.safeAreaLayoutGuide.snp.bottom)
                    }
                    
                    self.inputBar.snp.remakeConstraints { make in
                        make.left.right.equalToSuperview()
                        make.bottom.equalTo(self.view.safeAreaLayoutGuide.snp.bottom)
                    }
                case .checkView:
                    self.inputBar.resignSelf()
                    self.checkView.alpha = 1
                    self.checkView.snp.remakeConstraints { make in
                        make.left.right.equalToSuperview()
                        make.bottom.equalTo(self.view.safeAreaLayoutGuide.snp.bottom)
                    }
                    self.inputBar.snp.remakeConstraints { make in
                        make.left.right.equalToSuperview()
                        make.bottom.equalTo(self.checkView.snp.top)
                    }
                case .keyboard(let height):
                    self.checkView.alpha = 0
                    self.checkView.snp.remakeConstraints { make in
                        make.left.right.equalToSuperview()
                        make.top.equalTo(self.view.safeAreaLayoutGuide.snp.bottom)
                    }
                    self.inputBar.snp.remakeConstraints { make in
                        make.left.right.equalToSuperview()
                        make.bottom.equalToSuperview().offset(-height + 1)
                    }
                }
                UIView.animate(withDuration: 0.3) {
                    self.view.setNeedsLayout()
                    self.view.layoutIfNeeded()
                }
            })
            .disposed(by: disposeBag)
        
        inputBar.rx.signButtonClick
            .map {
                " 汪! "
            }
            .map {
                Reactor.Action.sendTextMessage($0)
            }
            .bind(to: reactor.action)
            .disposed(by: disposeBag)
        
        checkView.rx.imageButtonDidClick
            .subscribe(onNext: {
                [weak self] in
                guard let self = self else { return }
                self.present(self.imagePicker, animated: true)
            })
            .disposed(by: disposeBag)
        
        checkView.rx.liveButtonDidClick
            .subscribe(onNext: {
                [weak self] view in
                guard let self = self else { return }
                debugPrint("go in to check in view")
                let vc = LiveViewController()
                vc.roomName = "test"
                self.navigationController?.pushViewController(vc, animated: true);
                
            })
            .disposed(by: disposeBag)
        
        selectedImage.asObservable()
            .map {
                Reactor.Action.sendImageMessage($0)
            }
            .bind(to: reactor.action)
            .disposed(by: disposeBag)
    }
}

extension ChatViewController: UIImagePickerControllerDelegate, UINavigationControllerDelegate {
    func imagePickerController(_ picker: UIImagePickerController, didFinishPickingMediaWithInfo info: [UIImagePickerController.InfoKey : Any]) {
        guard let image = info[.originalImage] as? UIImage else {
            return
        }
        selectedImage.onNext(image)
        picker.dismiss(animated: true)
    }
}
