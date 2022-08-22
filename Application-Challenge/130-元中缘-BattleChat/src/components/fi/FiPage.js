import React from "react";
import { Avatar, Badge, Button, Card, Input, List, Modal, Popup, Toast } from 'antd-mobile';
import {queryMessage, saveMessage ,queryFiUserList, saveFiUser} from '../../api/fiApi'
import AudioAndVideoPage from "../tool/AudioAndVideoPage";
import ChatPage from "./ChatPage";
import WebIM from 'easemob-websdk'

class FiPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      userList:[],
      messageVisible: false,
      messageList: [],
      pickervisible: false,
      sendParam: {
        userId: '',
        type: '',
      }
    }
    this.handleQueryList = this.handleQueryList.bind(this);
    this.handleAdd = this.handleAdd.bind(this);
    this.handleEvent = this.handleEvent.bind(this);
    this.handleDelete = this.handleDelete.bind(this);
    this.handleAccept = this.handleAccept.bind(this);
    this.handleDecline = this.handleDecline.bind(this);
    this.handleAddBlocklist = this.handleAddBlocklist.bind(this);
    this.handleRemoveBlocklist = this.handleRemoveBlocklist.bind(this);
    this.handleQueryBlocklist = this.handleQueryBlocklist.bind(this);
    this.handleViewAddFi = this.handleViewAddFi.bind(this);
    this.handleMessage = this.handleMessage.bind(this);
    this.handleAddMessage = this.handleAddMessage.bind(this);
    this.handleRefreshMessage = this.handleRefreshMessage.bind(this);
    this.handleRefreshFiUser = this.handleRefreshFiUser.bind(this);
    this.handleSendAudioAndVideo = this.handleSendAudioAndVideo.bind(this);
    this.handleYesAndNo = this.handleYesAndNo.bind(this);
    this.handleSetNewLab = this.handleSetNewLab.bind(this);
  }
  componentDidMount(){
    this.handleEvent();
    this.handleRefreshMessage();
    this.handleRefreshFiUser();
  }
  handleRefreshMessage(){
    let messageList = queryMessage();
    messageList = messageList ? messageList : [];
    this.setState({
      messageList
    })
    return messageList;
  }
  handleRefreshFiUser(){
    this.handleQueryList();
    let userList = queryFiUserList();
    userList = userList ? userList : [];
    this.setState({
      userList
    })
    return userList;
  }
  handleQueryList(){
    // 好友列表查询
    let IMConn =window.IMConn;
    IMConn.getContacts({
      success: (res) => {
        /**
         * [{jid:'', name: '',subscription: ''}]
         */
        console.log('getContacts success', res);
        Toast.show({
          icon: 'success',
          content: '成功',
        })
      },
      error: (res) => {
        console.log('getContacts error', res);
        Toast.show({
          icon: 'fail',
          content: res['data']['message'],
        })
      }
    })
  }
  handleAdd(userId){
    let userList = this.state.userList;
    let filterList = userList.filter((u) => u['userId'] === userId);
    if(filterList && filterList.length > 0){
      Toast.show({
        icon: 'fail',
        content: '你们已经是好友了喔！',
      })
      return;
    }
    // 添加好友
    let IMConn =window.IMConn;
    IMConn.addContact(userId, "加个好友呗!");
    this.handleAddMessage('请求添加用户，用户ID:' + userId);
  }
  handleAddMessage(data, type){
    let messageList = this.handleRefreshMessage();
    messageList = [this.handleInitMessage(data, type), ...messageList];
    saveMessage(messageList)
    this.handleRefreshMessage();
  }
  handleInitMessage(data = {}, type = 0){
    return {
      title: type === 1 ? '好友申请消息' : '普通消息', // 0-普通文本消息、1-好友申请消息
      type: type, // 0-普通文本消息、1-好友申请消息
      data
    }
  }
  handleDelete(userId){
    // 删除好友
    let IMConn =window.IMConn;
    IMConn.deleteContact(userId);
  }
  handleAccept(userId, isRefreshMessage = false){
    let userList = this.state.userList;
    let filterList = userList.filter((u) => u['userId'] === userId);
    if(filterList && filterList.length > 0){
      return;
    }
    // 接受好友申请
    let IMConn =window.IMConn;
    IMConn.acceptContactInvite(userId);
    userList = this.handleRefreshFiUser();
    userList.push({userId});
    saveFiUser(userList)
    this.handleRefreshFiUser();
    if(isRefreshMessage === true){
      this.handleYesAndNo(userId, '同意');
    }
  }
  handleYesAndNo(userId, yesAndNo){
    let messageList = this.handleRefreshMessage();
    messageList.map((m) => {
      if(m['type'] === 1 && m['data']['from'] === userId){
        m.yesAndNo = yesAndNo;
      }
      return m;
    });
    saveMessage(messageList);
    this.handleRefreshMessage();
  }
  handleDecline(userId){
    let userList = this.state.userList;
    let filterList = userList.filter((u) => u['userId'] === userId);
    if(filterList && filterList.length > 0){
      return;
    }
    // 拒绝好友申请
    let IMConn =window.IMConn;
    IMConn.declineContactInvite(userId);
  }
  handleAddBlocklist(userId){
    //可以添加单个用户 ID 或批量添加多个用户 ID 组成的数组。
    let IMConn =window.IMConn;
    IMConn.addUsersToBlocklist({
      name: [userId],
    })
  }
  handleRemoveBlocklist(userId){
    //可以添加单个用户 ID 或批量添加多个用户 ID 组成的数组。
    let IMConn =window.IMConn;
    IMConn.removeUserFromBlockList({
      name: [userId],
    });
  }
  handleQueryBlocklist(){
    // 黑名单列表
    let IMConn =window.IMConn;
    IMConn.getBlocklist().then((res) => {
      console.log(res);
    });
  }
  handleEvent(){
    let IMConn =window.IMConn;
    const _this = this;
    IMConn.addEventHandler("contactEvent", {
      // 当前用户收到好友请求。用户 B 向用户 A 发送好友请求，用户 A 收到该事件。
      /**
       * {
       *  from:'test', // 来自test的好友申请
       *  status: '加个好友呗！', // 申请描述
       *  to: 'test1', // 发送给test1的好友申请
       *  type: 'subscribe' // 类型 subscribe-订阅
       * }
       */
      onContactInvited: function (msg) {
        console.log('onContactInvited:' + JSON.stringify(msg))
        _this.handleAddMessage(msg, 1)
      },
      // 当前用户被其他用户从联系人列表上移除。用户 B 将用户 A 从联系人列表上删除，用户 A 收到该事件。
      onContactDeleted: function (msg) {
        console.log('onContactDeleted:' + JSON.stringify(msg))
      },
      // 当前用户新增了联系人。 用户 B 向用户 A 发送好友请求，用户 A 同意该请求，用户 A 收到该事件，而用户 B 收到 `onContactAgreed` 事件。
      onContactAdded: function (msg) {
        console.log('onContactAdded:' + JSON.stringify(msg))
      },
      // 当前用户发送的好友请求被拒绝。 用户 A 向用户 B 发送好友请求，用户 B 收到好友请求后，拒绝加好友，则用户 A 收到该事件。
      onContactRefuse: function (msg) {
        console.log('onContactRefuse:' + JSON.stringify(msg))
      },
      // 当前用户发送的好友请求经过了对方同意。 用户 A 向用户 B 发送好友请求，用户 B 收到好友请求后，同意加好友，则用户 A 收到该事件。
      // {"type":"subscribed","to":"test1","from":"test","status":""}
      onContactAgreed: function (msg) {
        console.log('onContactAgreed:' + JSON.stringify(msg))
        _this.handleAddMessage('用户:' + msg['from'] + "，同意了您的好友申请。")
        _this.handleAccept(msg['from']);
      },
      // 收到自定义消息的回调。
      // {"id":"1044354311204636040","type":"custom","chatType":"singleChat","from":"test1","to":"test","customEvent":"customEvent","params":{},"customExts":{"channel":"","type":"audio"},"ext":{},"time":1660722486492,"onlineState":3}
       onCustomMessage: async (msg) => {
        console.log('onCustomMessage:' + JSON.stringify(msg))
        let customExts = msg['customExts'];
        const result = await Modal.confirm({
          content: '邀请您语音',
        })
        if (result) {
          // 同意
          _this.handleSendAudioAndVideo({...customExts});
        } else {
          // 拒绝
        }
      },
      // 收到消息已送达回执的回调。
      onDeliveredMessage: (msg) => {
        console.log('onDeliveredMessage:' + JSON.stringify(msg))

      },
      // 收到图片消息的回调。
      onImageMessage: (msg) => {
        console.log('onImageMessage:' + JSON.stringify(msg))

      },
      // 收到文本消息的回调。
      // {
      //   "id": "1043977001318221192",
      //   "type": "txt",
      //   "chatType": "singleChat",
      //   "msg": "你今天吃饭了吗？",
      //   "to": "test1",
      //   "from": "test",
      //   "ext": {},
      //   "time": 1660634637181,
      //   "onlineState": 3
      // }
      onTextMessage: (msg) => {
        console.log('onTextMessage:' + JSON.stringify(msg))
        _this.refs['ChatPageRef']['handleAddChat']({from: msg['from'], to:msg['to'], type: 'left', msg: msg['msg']});
      },
      // 网络断开的回调。
      onOffline: () => {
        console.log('onOffline')

      },
      // 网络连接的回调。
      onOnline: () => {
        console.log('onOnline')

      },
      // 被订阅用户的在线状态变更回调。
      onPresenceStatusChange: (msg) => {
        console.log('onPresenceStatusChange:' + JSON.stringify(msg))

      },
      // 收到消息已读回执的回调。
      onReadMessage: (msg) => {
        console.log('onReadMessage:' + JSON.stringify(msg))

      },
    });
  }
  async handleViewAddFi(){
    const result = await Modal.confirm({
      title: '添加好友',
      content: (
        <>
          <List>
            <List.Item title="请输入用户ID">
              <Input id='userAddInput'></Input>
            </List.Item>
          </List>
        </>
      ),
    })
    if(result){
      this.handleAdd(document.getElementById('userAddInput').value);
    }
  }
  handleMessage(){
    let messageVisible = !this.state.messageVisible
    let messageList = this.state.messageList;
    if(messageVisible === true){
      // 刷新消息信息
      messageList = queryMessage();
    }
    this.setState({
      messageVisible,
      messageList
    })
  }
  handleSendAudioAndVideo(msg){
    // 发送消息，邀请语音或视频
    this.refs['AudioAndVideoPageRef']['handleCreate']({
      operation: 'add',
      groupName: '默认',
      channelType: msg['type'],
      channel: msg['channel']
    });
  }
  handleSetNewLab(userId = '', val){
    const {userList} = this.state;
    let newUserList = userList.map((u) => {
      if(u['userId'] === userId){
        u.newLab = (u['newLab'] ? u['newLab'] : 0) + 1
        if(val || val === 0){
          u.newLab = 0;
        }
      }
      return u;
    });
    this.setState({
      userList: newUserList
    });
  }
  render() {
    const {userList, messageVisible, messageList, pickervisible} = this.state;
    return (
      <div>
        <AudioAndVideoPage ref='AudioAndVideoPageRef'/>
        <ChatPage ref='ChatPageRef' handleSetNewLab={this.handleSetNewLab} handleSendAudioAndVideo={this.handleSendAudioAndVideo}/>
        <Popup
          visible={messageVisible}
          bodyStyle={{ height: '70%' }}
          closeOnMaskClick
          onClose={this.handleMessage}
        >
          <List>
            {
              messageList && messageList.length > 0 ? messageList.map((m, index) => {
                let data = m['data']
                return <List.Item key={'mmm_' + index}>
                  <Card title={m['title']}>
                    {
                      m['type'] === 1 ?<div>
                        <div>
                          <span>{data['from']}请求添加你为好友，是否同意？</span>
                        </div>
                        <div>
                          <Button disabled={m['yesAndNo']} color='primary' onClick={() => {this.handleAccept(data['from'])}}>同意</Button>
                          <Button disabled={m['yesAndNo']} color='warning' onClick={() => {this.handleDecline(data['from'])}}>拒绝</Button>
                        </div>
                      </div> : <span>{data}</span>
                    }
                  </Card>
                </List.Item>
              }) : <div style={{textAlign: 'center'}}><span>暂无数据</span></div>
            }
          </List>
        </Popup>
        <div>
          <Button onClick={this.handleViewAddFi}>添加好友</Button>
          <Button onClick={this.handleMessage}>消息中心</Button>
        </div>
        <div>
          <List>
            {
              userList && userList.length > 0 ? userList.map((u) => {
                return <List.Item key={'uuu_' + u['userId']} onClick={() => {
                  this.handleSetNewLab(u['userId'], 0);
                  this.refs['ChatPageRef']['handleVisible'](true);
                  this.refs['ChatPageRef']['handleSetFiInfo']({userId: u['userId']});
                }}>
                  <Card title={u['userId']}>
                    <Badge content={u['newLab'] && u['newLab'] !== 0 ? u['newLab'] : ''}>
                      <Avatar src='' />
                    </Badge>
                  </Card>
                </List.Item>
              }) : <span>暂无好友，快去添加吧</span>
            }
          </List>
        </div>
      </div>
    );
  }
}

export default FiPage;