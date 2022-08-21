

# Kago-打卡狗

## 项目简介
![项目简介](assets/readme.png)

## 安装部署指南
服务端已部署公有云。
移动端只需下载本工程，直接 build 即可运行。


## 功能简介
<video width="320" height="240" controls>
  <source src="video.mov" type="assets/video1.mp4">
</video>
<video width="320" height="240" controls>
  <source src="video.mov" type="assets/video2.mp4">
</video>


## 技术栈
后端架构：
1. nodejs
2. mongodb
后端已部署服务器

移动端架构：
1. SwiftUI
2. Combine
3. RxSwift
4. UIKit

SwiftUI 为 苹果新出的声明式 UI 框架，用以替代传统的 UIKit。
Combine 为响应式编程框架。

本项目采用了两种架构来完成。
1. 传统的 UIKit + ReactorKit 来完成核心模块的研发来保证质量
2. SwiftUI + Combin 完成非核心模块的研发，保证速度

核心模块由 Feature 组成，Feature 可以理解为一个具备独立功能的 Page。
利用 Reactor 将 View 与 State 进行双向绑定。来实现业务逻辑的整洁有序。

![](https://cloud.githubusercontent.com/assets/931655/25073432/a91c1688-2321-11e7-8f04-bf91031a09dd.png)

如 聊天列表页面，基于响应式编程框架，代码变得优雅简洁

```swift
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
            .map {
                Reactor.Action.appendMessages($0)
            }
            .bind(to: reactor.action)
            .disposed(by: disposeBag)
```

## 二次开发
无

# 许可协议

该参赛作品的源代码以`MIT`开源协议对外开源
