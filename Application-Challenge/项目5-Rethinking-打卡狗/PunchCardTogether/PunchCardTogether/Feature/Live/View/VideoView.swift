//
//  VideoView.swift
//  PunchCardTogether
//
//  Created by liaoyp on 2022/8/21.
//

import UIKit
import SnapKit

class VideoView: UIView {
    
    fileprivate(set) var videoView: UIView!
    
    fileprivate var infoView: UIView!
    fileprivate var infoLabel: UILabel!
    fileprivate var avatar: UIImageView!

    var isVideoMuted = false {
        didSet {
            videoView?.isHidden = isVideoMuted
        }
    }
    
    override init(frame frameRect: CGRect) {
        super.init(frame: frameRect)
        translatesAutoresizingMaskIntoConstraints = false
        backgroundColor = UIColor.white
        
        addVideoView()
        addInfoView()
        addAvatarView()
    }
    
    required init?(coder: NSCoder) {
        fatalError("init(coder:) has not been implemented")
    }
}

extension VideoView {
    func update(with info: StatisticsInfo) {
        
        debugPrint(info.description())
        // UI上不展示
//        infoLabel?.text = info.description()
    }
}

private extension VideoView {
    func addVideoView() {
        videoView = UIView()
        videoView.translatesAutoresizingMaskIntoConstraints = false
        videoView.backgroundColor = UIColor.clear
        addSubview(videoView)
        
        videoView.snp.makeConstraints { make in
            make.edges.equalToSuperview()
        }

    }
    
    func addAvatarView() {
        avatar = UIImageView()
        avatar.layer.cornerRadius = 30
        avatar.layer.masksToBounds = true
        let number: Int = Int(arc4random_uniform(9))
        avatar.image = UIImage.init(named: "avatar\(number)")
        self.addSubview(avatar)
        
        avatar.snp.makeConstraints { make in
            make.size.equalTo(CGSize(width: 60, height: 60))
            make.centerX.equalToSuperview()
            make.top.equalTo(videoView.snp.top)
        }
    }
    
    func addInfoView() {
        infoView = UIView()
        infoView.backgroundColor = UIColor.clear
        
        addSubview(infoView)
        infoView.snp.makeConstraints { make in
            make.left.right.equalTo(videoView)
            make.top.equalTo(videoView.snp.top)
            make.height.equalTo(140)
        }
        
        func createInfoLabel() -> UILabel {
            let label = UILabel()
            label.translatesAutoresizingMaskIntoConstraints = false
            
            label.text = " "
            label.shadowOffset = CGSize(width: 0, height: 1)
            label.shadowColor = UIColor.black
            label.numberOfLines = 0
            
            label.font = UIFont.systemFont(ofSize: 12)
            label.textColor = UIColor.white
            
            return label
        }
        
        infoLabel = createInfoLabel()
        infoView.addSubview(infoLabel)
        
        let top: CGFloat = 20
        let left: CGFloat = 10
        
        infoLabel.snp.makeConstraints { make in
            make.top.equalTo(infoView.snp.top).offset(top)
            make.left.equalTo(infoView.snp.left).offset(left)
            make.right.equalTo(infoView.snp.right).offset(-left)
            make.bottom.equalTo(infoView.snp.bottom)
        }
    }
}
