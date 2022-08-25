//
//  MessageTableViewCell.swift
//  PunchCardTogether
//
//  Created by zang qilong on 2022/8/20.
//

import UIKit
import GrowingTextView
import Reusable
import HyphenateChat
import Defaults

class TextMessageTableViewCell: UITableViewCell, Reusable {
    private lazy var avatarImageView: UIImageView = {
        let instance = UIImageView(image: nil)
        instance.clipsToBounds = true
        instance.layer.cornerRadius = 55.0/2
        instance.contentMode = .scaleAspectFit
        instance.backgroundColor = UIColor(rgb: 0xf5f5f5)
        return instance
    }()
    private lazy var nameLabel: UILabel = {
        let instance = UILabel()
        instance.font = PCFont.puhui.uifont(size: 14, style: .medium)
        instance.textColor = .white
        instance.numberOfLines = 0
        return instance
    }()
    private lazy var textContainerView: UIView = {
       let instance = UIView()
        instance.layer.cornerRadius = 10
        instance.clipsToBounds = true
        return instance
    }()
    private lazy var contentLabel: UILabel = {
        let instance = UILabel()
        instance.font = PCFont.puhui.uifont(size: 14, style: .medium)
        instance.textColor = UIColor(rgb: 0x282828)
        return instance
    }()
    
    override init(style: UITableViewCell.CellStyle, reuseIdentifier: String?) {
        super.init(style: style, reuseIdentifier: reuseIdentifier)
        backgroundColor = .clear
        selectionStyle = .none
        contentView.addSubview(avatarImageView)
        contentView.addSubview(nameLabel)
        contentView.addSubview(textContainerView)
        textContainerView.addSubview(contentLabel)
    }
    
    required init?(coder: NSCoder) {
        fatalError("init(coder:) has not been implemented")
    }
    
    private func resetLayout(direction: MessageDirection) {
        if direction == .left {
            avatarImageView.snp.remakeConstraints { make in
                make.size.equalTo(CGSize(width: 55, height: 55))
                make.left.equalToSuperview().offset(18)
                make.top.equalToSuperview().offset(30)
            }
            
            nameLabel.snp.remakeConstraints { make in
                make.top.equalTo(avatarImageView)
                make.left.equalTo(avatarImageView.snp.right).offset(13)
            }
            
            textContainerView.snp.remakeConstraints { make in
                make.left.equalTo(nameLabel)
                make.top.equalTo(nameLabel.snp.bottom).offset(8)
                make.bottom.equalToSuperview()
                make.width.lessThanOrEqualTo(MessageConstants.textCellMaxWidth)
            }
            
            contentLabel.snp.remakeConstraints { make in
                make.top.bottom.equalToSuperview().inset(8)
                make.left.right.equalToSuperview().inset(13)
            }
        } else {
            avatarImageView.snp.remakeConstraints { make in
                make.size.equalTo(CGSize(width: 55, height: 55))
                make.right.equalToSuperview().inset(18)
                make.top.equalToSuperview().offset(30)
            }
            
            nameLabel.snp.remakeConstraints { make in
                make.top.equalTo(avatarImageView)
                make.right.equalTo(avatarImageView.snp.left).offset(-13)
            }
            
            textContainerView.snp.remakeConstraints { make in
                make.right.equalTo(nameLabel)
                make.top.equalTo(nameLabel.snp.bottom).offset(8)
                make.bottom.equalToSuperview()
                make.width.lessThanOrEqualTo(MessageConstants.textCellMaxWidth)
            }
            
            contentLabel.snp.remakeConstraints { make in
                make.top.bottom.equalToSuperview().inset(8)
                make.left.right.equalToSuperview().inset(13)
            }
        }
    }
    
    public func updateCell(item: ChatMessage) {
        let direction = messageDirection(message: item.message)
        guard let textBody = item.message.body as? EMTextMessageBody else {
            return
        }
        contentLabel.text = textBody.text
        contentLabel.textColor = direction.textColor
        textContainerView.backgroundColor = direction.backgroundColor
        let avatarName = (item.message.ext?["avatar"] as? String) ?? "avatar1"
        avatarImageView.image = UIImage(named: avatarName)
        nameLabel.text = (item.message.ext?["nickname"] as? String) ?? item.message.from
        resetLayout(direction: direction)
    }
    
    func messageDirection(message: EMChatMessage) -> MessageDirection {
        if let account = Defaults[.loginUser]?.account, message.from == "\(account)" {
            return .right
        }
        return .left
    }
}
