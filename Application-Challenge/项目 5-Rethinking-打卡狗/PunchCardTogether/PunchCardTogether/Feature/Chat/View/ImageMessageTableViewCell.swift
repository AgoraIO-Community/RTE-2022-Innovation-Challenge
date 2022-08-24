//
//  ImageMessageTableViewCell.swift
//  PunchCardTogether
//
//  Created by zang qilong on 2022/8/20.
//

import UIKit
import Reusable
import HyphenateChat
import Defaults
import Kingfisher

class ImageMessageTableViewCell: UITableViewCell, Reusable {
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
    private lazy var imageContainerView: UIView = {
       let instance = UIView()
        instance.layer.cornerRadius = 10
        instance.clipsToBounds = true
        return instance
    }()
    private lazy var uploadImageView: UIImageView = {
        let instance = UIImageView()
        instance.contentMode = .scaleAspectFit
        instance.kf.indicatorType = .activity
        instance.layer.cornerRadius = 10
        instance.clipsToBounds = true
        return instance
    }()
    private lazy var signInImageView: UIImageView = {
        let instance = UIImageView()
        instance.contentMode = .scaleAspectFit
        return instance
    }()
    private lazy var signinLabel: UILabel = {
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
        contentView.addSubview(imageContainerView)
        imageContainerView.addSubview(uploadImageView)
        imageContainerView.addSubview(signinLabel)
        imageContainerView.addSubview(signInImageView)
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
            
            imageContainerView.snp.remakeConstraints { make in
                make.left.equalTo(nameLabel)
                make.top.equalTo(nameLabel.snp.bottom).offset(8)
                make.bottom.equalToSuperview()
            }
            
            signInImageView.snp.makeConstraints { make in
                make.left.top.equalToSuperview().offset(12)
            }
            
            signinLabel.snp.makeConstraints { make in
                make.left.equalTo(signInImageView.snp.right).offset(12)
                make.centerY.equalTo(signInImageView)
                make.right.equalToSuperview().inset(12)
            }
            
            uploadImageView.snp.remakeConstraints { make in
                make.top.equalTo(signInImageView.snp.bottom).offset(15)
                make.bottom.equalToSuperview().inset(8)
                make.left.right.equalToSuperview().inset(13)
                make.size.equalTo(MessageConstants.imageMaxSize)
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
            
            imageContainerView.snp.remakeConstraints { make in
                make.right.equalTo(nameLabel)
                make.top.equalTo(nameLabel.snp.bottom).offset(8)
                make.bottom.equalToSuperview()
            }
            
            signInImageView.snp.makeConstraints { make in
                make.left.top.equalToSuperview().offset(12)
            }
            
            signinLabel.snp.makeConstraints { make in
                make.left.equalTo(signInImageView.snp.right).offset(12)
                make.centerY.equalTo(signInImageView)
                make.right.equalToSuperview().inset(12)
            }
            
            uploadImageView.snp.remakeConstraints { make in
                make.top.equalTo(signInImageView.snp.bottom).offset(15)
                make.bottom.equalToSuperview().inset(8)
                make.left.right.equalToSuperview().inset(13)
                make.size.equalTo(MessageConstants.imageMaxSize)
            }
        }
    }
    
    public func updateCell(item: ChatMessage) {
        let direction = messageDirection(message: item.message)
        guard let imageBody = item.message.body as? EMImageMessageBody else {
            return
        }
        imageContainerView.backgroundColor = direction.backgroundColor
        let avatarName = (item.message.ext?["avatar"] as? String) ?? "avatar1"
        avatarImageView.image = UIImage(named: avatarName)
        let name = (item.message.ext?["nickname"] as? String) ?? ""
        nameLabel.text = name
        signinLabel.text = "\(name)打卡成功"
        signinLabel.textColor = direction.textColor
        signInImageView.image = direction.signIcon
        resetLayout(direction: direction)
        let imageSize = MessageConstants.imageFitSize(imageSize: imageBody.size)
        uploadImageView.kf.setImage(with: URL(string: imageBody.remotePath))
        uploadImageView.snp.updateConstraints { make in
            make.size.equalTo(imageSize)
        }
    }
    
    func messageDirection(message: EMChatMessage) -> MessageDirection {
        if let account = Defaults[.loginUser]?.account, message.from == "\(account)" {
            return .right
        }
        return .left
    }
}
