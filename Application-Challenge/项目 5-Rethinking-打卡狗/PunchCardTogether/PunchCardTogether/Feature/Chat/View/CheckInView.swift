//
//  CheckInView.swift
//  PunchCardTogether
//
//  Created by zang qilong on 2022/8/21.
//

import UIKit
import RxSwift

class CheckInView: UIView {
    fileprivate lazy var imageButton: UIButton = {
        let instance = UIButton()
        instance.setImage(UIImage(named: "image_kago"), for: .normal)
        instance.contentMode = .scaleAspectFill
        return instance
    }()
    fileprivate lazy var videoButton: UIButton = {
        let instance = UIButton()
        instance.setImage(UIImage(named: "video_kago"), for: .normal)
        instance.contentMode = .scaleAspectFill
        return instance
    }()
    fileprivate lazy var liveButton: UIButton = {
        let instance = UIButton()
        instance.setImage(UIImage(named: "live_kago"), for: .normal)
        instance.contentMode = .scaleAspectFill
        return instance
    }()
    
    override init(frame: CGRect) {
        super.init(frame: frame)
        backgroundColor = .white
        addSubview(imageButton)
        addSubview(videoButton)
        addSubview(liveButton)
        
        imageButton.snp.makeConstraints { make in
            make.left.top.bottom.equalToSuperview()
            make.width.equalTo(UIScreen.main.bounds.width/3)
        }
        
        videoButton.snp.makeConstraints { make in
            make.left.equalTo(imageButton.snp.right)
            make.top.equalToSuperview()
            make.width.equalTo(UIScreen.main.bounds.width/3)
        }
        
        liveButton.snp.makeConstraints { make in
            make.right.equalToSuperview()
            make.left.equalTo(videoButton.snp.right)
            make.top.equalToSuperview()
        }
    }
    
    required init?(coder: NSCoder) {
        fatalError("init(coder:) has not been implemented")
    }
}

extension Reactive where Base == CheckInView {
    var imageButtonDidClick: Observable<Void> {
        return base.imageButton.rx.tap.asObservable()
    }
    
    var liveButtonDidClick: Observable<Void> {
        return base.liveButton.rx.tap.asObservable()
    }
}
