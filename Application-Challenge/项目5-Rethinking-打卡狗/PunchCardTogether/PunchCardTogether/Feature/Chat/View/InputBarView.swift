//
//  InputBar.swift
//  PunchCardTogether
//
//  Created by zang qilong on 2022/8/20.
//

import UIKit
import GrowingTextView
import RxSwift
import RxCocoa

class InputBarView: UIView {
    fileprivate lazy var inputTextView: GrowingTextView = {
        let instance = GrowingTextView(frame: .zero)
        instance.maxHeight = 140
        instance.minHeight = 34
        instance.placeholder = "说点什么"
        instance.returnKeyType = .send
        instance.layer.cornerRadius = 17
        instance.clipsToBounds = true
        instance.layer.borderWidth = 1.0
        instance.layer.borderColor = UIColor(rgb: 0xD0D8E7).cgColor
        return instance
    }()
    fileprivate lazy var plusButton: UIButton = {
        let instance = UIButton()
        instance.setImage(UIImage(named: "inputbar_right_button"), for: .normal)
        return instance
    }()
    fileprivate lazy var signButton: UIButton = {
        let instance = UIButton()
        instance.titleLabel?.font = PCFont.puhui.uifont(size: 14, style: .medium)
        instance.setTitleColor(.white, for: .normal)
        instance.setTitle("长按打卡", for: .normal)
        instance.backgroundColor = UIColor(rgb: 0x0099FF)
        instance.layer.cornerRadius = 17
        let longPress = UILongPressGestureRecognizer(target: self, action: #selector(handleLongPress))
        instance.addGestureRecognizer(longPress)
        instance.addTarget(self, action: #selector(handleSignButtonClick), for: .touchUpInside)
        return instance
    }()
    private lazy var tipsImageView: UIImageView = {
        let instance = UIImageView(image: UIImage(named: "not_signin_tips"))
        instance.contentMode = .scaleAspectFit
        instance.backgroundColor = .clear
        instance.alpha = 0
        return instance
    }()
    fileprivate let longPressAction = PublishSubject<Void>()
    
    private let separator = UIView()
    
    override init(frame: CGRect) {
        super.init(frame: frame)
        backgroundColor = .white
        addSubview(inputTextView)
        addSubview(plusButton)
        addSubview(separator)
        addSubview(signButton)
        addSubview(tipsImageView)
        
        separator.backgroundColor = UIColor(rgb: 0xD0D8E7)
        separator.snp.makeConstraints { make in
            make.top.equalToSuperview()
            make.left.right.equalToSuperview()
            make.height.equalTo(1)
        }
        
        inputTextView.snp.makeConstraints { make in
            make.left.equalToSuperview().offset(13)
            make.top.bottom.equalToSuperview().inset(13)
            make.height.greaterThanOrEqualTo(39)
            make.right.equalTo(plusButton.snp.left).offset(-13)
        }
        
        plusButton.snp.makeConstraints { make in
            make.size.equalTo(CGSize(width: 30, height: 30))
            make.right.equalToSuperview().offset(-13)
            make.top.equalToSuperview().offset(15)
        }
        
        signButton.snp.makeConstraints { make in
            make.edges.equalTo(inputTextView)
        }
        
        tipsImageView.snp.makeConstraints { make in
            make.bottom.equalTo(separator.snp.top)
            make.centerX.equalToSuperview()
        }
    }
    
    required init?(coder: NSCoder) {
        fatalError("init(coder:) has not been implemented")
    }
    
    @objc func handleLongPress() {
        longPressAction.onNext(())
    }
    
    @objc func handleSignButtonClick() {
        UIView.animate(withDuration: 0.1, delay: 0) {
            self.tipsImageView.alpha = 1
        }
        UIView.animate(withDuration: 0.1, delay: 1) {
            self.tipsImageView.alpha = 0
        }
    }
    
    func resignSelf() {
        self.inputTextView.resignFirstResponder()
        self.inputTextView.text = ""
    }
    
    func isFirstResponder() -> Bool {
        return inputTextView.isFirstResponder
    }
}

extension Reactive where Base == InputBarView {
    var returnKeyDidClick: Observable<String> {
        return base.inputTextView.rx.text.orEmpty.distinctUntilChanged()
            .filter {
                if let charater = $0.last {
                    return String(charater) == "\n"
                }
                return false
            }
    }
    
    var plusButtonClick: Observable<Void> {
        return base.plusButton.rx.tap.asObservable()
    }
    
    var signButtonEnabled: Binder<Bool> {
        return Binder(base) { view, isSign in
            view.signButton.isHidden = isSign
        }
    }
    
    var signLongPress: Observable<Void> {
        return base.longPressAction.asObservable()
    }
    
    var signButtonClick: Observable<Void> {
        return base.signButton.rx.tap.asObservable()
    }
}
