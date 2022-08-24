//
//  ConversationTableViewCell.swift
//  PunchCardTogether
//
//  Created by zang qilong on 2022/8/20.
//

import UIKit
import HyphenateChat
import Reusable
import RxSwift

class ConversationTableViewCell: UITableViewCell, Reusable {
    private lazy var containerView = UIView()
    private lazy var avatarImageView: UIImageView = {
       let instance = UIImageView(image: UIImage(named: "conversation1"))
        return instance
    }()
    private lazy var nameLabel: UILabel = {
        let instance = UILabel()
        instance.font = PCFont.puhui.uifont(size: 21, style: .medium)
        instance.textColor = UIColor(rgb: 0x0A0E2F)
        return instance
    }()
    private lazy var timeLabel: UILabel = {
        let instance = UILabel()
        instance.font = PCFont.puhui.uifont(size: 14, style: .medium)
        instance.textColor = UIColor(rgb: 0x0A0E2F).withAlphaComponent(0.3)
        return instance
    }()
    private lazy var contentLabel: UILabel = {
        let instance = UILabel()
        instance.font = PCFont.puhui.uifont(size: 14, style: .medium)
        instance.textColor = UIColor(rgb: 0x0A0E2F).withAlphaComponent(0.5)
        return instance
    }()
    fileprivate let updateSubject = PublishSubject<String>()
    var disposeBag = DisposeBag()
    
    override init(style: UITableViewCell.CellStyle, reuseIdentifier: String?) {
        super.init(style: style, reuseIdentifier: reuseIdentifier)
        backgroundColor = UIColor(rgb: 0xf5f5f5)
        selectionStyle = .none
        buildLayout()
    }
    
    required init?(coder: NSCoder) {
        fatalError("init(coder:) has not been implemented")
    }
    
    override func prepareForReuse() {
        super.prepareForReuse()
        disposeBag = DisposeBag()
    }
    
    private func buildLayout() {
        contentView.addSubview(containerView)
        containerView.addSubview(avatarImageView)
        containerView.addSubview(nameLabel)
        containerView.addSubview(timeLabel)
        containerView.addSubview(contentLabel)
        
        containerView.layer.borderWidth = 1.0
        containerView.layer.borderColor = UIColor(rgb: 0xBDD7EF).cgColor
        containerView.layer.cornerRadius = 7
        containerView.backgroundColor = .white
        containerView.snp.makeConstraints { make in
            make.left.right.equalToSuperview().inset(8)
            make.top.bottom.equalToSuperview().inset(4)
        }
        
        avatarImageView.snp.makeConstraints { make in
            make.size.equalTo(CGSize(width: 72, height: 72))
            make.top.bottom.equalToSuperview().inset(14)
            make.leading.equalToSuperview().offset(20)
        }
        
        nameLabel.snp.makeConstraints { make in
            make.leading.equalTo(avatarImageView.snp.trailing).offset(14)
            make.top.equalTo(avatarImageView).offset(3)
        }
        
        contentLabel.snp.makeConstraints { make in
            make.leading.equalTo(nameLabel)
            make.trailing.equalToSuperview().inset(13)
            make.top.equalTo(nameLabel.snp.bottom).offset(7)
        }
        
        timeLabel.snp.makeConstraints { make in
            make.trailing.equalToSuperview().inset(16)
            make.centerY.equalTo(nameLabel)
        }
    }
    
    func updateCell(item: ConversationItem) {
        nameLabel.text = item.name.isEmpty ? item.conversation.conversationId : item.name
        let unread = item.conversation.unreadMessagesCount > 0 ? "[\(item.conversation.unreadMessagesCount)条]" : ""
        contentLabel.text = unread + (messageContent(message: item.conversation.latestMessage) ?? "")
        timeLabel.text = conversationTime(message: item.conversation.latestMessage)
        if item.name.isEmpty {
            updateSubject.onNext(item.conversation.conversationId)
        }
    }
    
    func messageContent(message: EMChatMessage) -> String? {
        if let textBody = message.body as? EMTextMessageBody {
            return textBody.text
        }
        if message.body is EMImageMessageBody {
            return "图片打卡"
        }
        return nil
    }
    
    func conversationTime(message: EMChatMessage) -> String {
        let receiveTime = Date(timeIntervalSince1970: Double(message.localTime)/1000)
        let formatter = DateFormatter()
        formatter.dateFormat = "HH:mm"
        return formatter.string(from: receiveTime)
    }
}

extension Reactive where Base == ConversationTableViewCell {
    var shouldUpdateGroupName: Observable<String> {
        return base.updateSubject.asObservable()
    }
}
