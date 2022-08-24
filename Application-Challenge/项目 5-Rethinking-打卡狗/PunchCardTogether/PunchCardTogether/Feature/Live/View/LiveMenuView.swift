//
//  LiveMenuView.swift
//  PunchCardTogether
//
//  Created by liaoyp on 2022/8/21.
//

import UIKit
import RxSwift

class LiveMenuView: UIView {
        
    lazy var swichButton: UIButton = {
        let instance = UIButton()
        instance.setImage(UIImage(named: "icon-rotate"), for: .normal)
        instance.setImage(UIImage(named: "icon-rotate"), for: .normal)
        instance.titleLabel?.font = UIFont.systemFont(ofSize: 12);
        return instance
    }()
    lazy var videoButton: UIButton = {
        let instance = UIButton()
        instance.setImage(UIImage(named: "icon-camera"), for: .normal)
        instance.setImage(UIImage(named: "icon-camera off"), for: .selected)
        instance.contentMode = .scaleAspectFill
        instance.titleLabel?.font = UIFont.systemFont(ofSize: 12);

        return instance
    }()
    lazy var audioButton: UIButton = {
        let instance = UIButton()
        instance.setImage(UIImage(named: "icon-microphone"), for: .normal)
        instance.setImage(UIImage(named: "icon-microphone off"), for: .selected)
        instance.titleLabel?.font = UIFont.systemFont(ofSize: 12);
        
        return instance
    }()
    lazy var leaveButton: UIButton = {
        let instance = UIButton()
        instance.setImage(UIImage(named: "icon-exit"), for: .normal)
        instance.titleLabel?.font = UIFont.systemFont(ofSize: 12);

        return instance
    }()
    

    override init(frame: CGRect) {
        super.init(frame: frame)
        backgroundColor = UIColor(red: 0, green: 0.6, blue: 1, alpha: 1)
        
        addSubview(swichButton)
        addSubview(videoButton)
        addSubview(audioButton)
        addSubview(leaveButton)
        
        
        swichButton.snp.makeConstraints { make in
            make.left.top.bottom.equalToSuperview()
            make.width.equalTo(UIScreen.main.bounds.width/4)
        }
        
        videoButton.snp.makeConstraints { make in
            make.left.equalTo(swichButton.snp.right)
            make.top.bottom.equalToSuperview()
            make.width.equalTo(UIScreen.main.bounds.width/4)
        }
        
        audioButton.snp.makeConstraints { make in
            make.left.equalTo(videoButton.snp.right)
            make.top.bottom.equalToSuperview()
            make.width.equalTo(UIScreen.main.bounds.width/4)
        }
        
        leaveButton.snp.makeConstraints { make in
            make.right.equalToSuperview()
            make.left.equalTo(audioButton.snp.right)
            make.top.bottom.equalToSuperview()
        }
    }
    
    required init?(coder: NSCoder) {
        fatalError("init(coder:) has not been implemented")
    }
}

extension Reactive where Base == LiveMenuView {
    var swichButtonDidClick: Observable<Void> {
        return base.swichButton.rx.tap.asObservable()
    }
    
    var leaveButtonDidClick: Observable<Void> {
        return base.leaveButton.rx.tap.asObservable()
    }
}


import Foundation
import UIKit
/*
 枚举 设置 图片的位置
 */
public enum ButtonImagePosition : Int{
    
    case PositionTop = 0
    case Positionleft
    case PositionBottom
    case PositionRight
}


extension UIButton {
    
    //pragma MARK:
    
    /*
     自由设置button上文字和图片的位置
     imageName:图片的名字
     title：button 的名字
     type ：image 的位置
     Space ：图片文字之间的间距
     */
    public func setImageAndTitle (imageName:String, title:String, type:ButtonImagePosition, Space space:CGFloat)  {
        self.setTitle(title, for: .normal)
        self.setImage(UIImage(named:imageName), for: .normal)
        
        let imageWith :CGFloat = (self.imageView?.frame.size.width)!;
        let imageHeight :CGFloat = (self.imageView?.frame.size.height)!;
        
        var labelWidth :CGFloat = 0.0;
        var labelHeight :CGFloat = 0.0;
        
        labelWidth = CGFloat(self.titleLabel!.intrinsicContentSize.width);
        labelHeight = CGFloat(self.titleLabel!.intrinsicContentSize.height);
        
        var  imageEdgeInsets :UIEdgeInsets = UIEdgeInsets();
        var  labelEdgeInsets :UIEdgeInsets = UIEdgeInsets();
        
        switch type {
        case .PositionTop:
            imageEdgeInsets = UIEdgeInsets(top: -labelHeight - space/2.0, left: 0, bottom: 0, right: -labelWidth);
            labelEdgeInsets = UIEdgeInsets(top: 0, left: -imageWith, bottom: -imageHeight-space/2.0, right: 0);
            break;
        case .Positionleft:
            imageEdgeInsets = UIEdgeInsets(top: 0, left: -space/2.0, bottom: 0, right: space/2.0);
            labelEdgeInsets = UIEdgeInsets(top: 0, left: space/2.0, bottom: 0, right: -space/2.0);
            break;
        case .PositionBottom:
            imageEdgeInsets = UIEdgeInsets(top: 0, left: 0, bottom: -labelHeight-space/2.0, right: -labelWidth);
            labelEdgeInsets = UIEdgeInsets(top: -imageHeight-space/2.0, left: -imageWith, bottom: 0, right: 0);
            break;
        case .PositionRight:
            imageEdgeInsets = UIEdgeInsets(top: 0, left: labelWidth+space/2.0, bottom: 0, right: -labelWidth-space/2.0);
            labelEdgeInsets = UIEdgeInsets(top: 0, left: -imageWith-space/2.0, bottom: 0, right: imageWith+space/2.0);
            break;
            
        }
        
        // 4. 赋值
        self.titleEdgeInsets = labelEdgeInsets;
        self.imageEdgeInsets = imageEdgeInsets;
        
    }
    
}
