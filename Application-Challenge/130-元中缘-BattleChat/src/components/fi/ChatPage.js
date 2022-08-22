import React from "react";
import { Button, Card, Input, List, Popup } from 'antd-mobile';
import {getToken} from '../../utils/store';
import WebIM from 'easemob-websdk'

class ChatPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      userInfo: {}, // {userId: 1}
      fiInfo: {}, // {userId: 1, nickName:'好友名称'}
      visible: false,
      chatList: [], // {userId: 1, type: 'left/right', msg: '你吃饭了吗？'}
    }
    this.handleVisible = this.handleVisible.bind(this);
    this.handleAddChat = this.handleAddChat.bind(this);
    this.handleSendMsgByCustom = this.handleSendMsgByCustom.bind(this);
    this.handleSetFiInfo = this.handleSetFiInfo.bind(this);
    this.handleSendMsg = this.handleSendMsg.bind(this);

    this.handleSetNewLab = props['handleSetNewLab'] ? props['handleSetNewLab'] : () => {}
    this.handleSendAudioAndVideo = props['handleSendAudioAndVideo'] ? props['handleSendAudioAndVideo'] : () => {}
  }
  componentDidMount(){
    let token = getToken();
    if(!token){
      return;
    }
    this.setState({
      userInfo: {userId: token['userId']}
    });
  }
  handleVisible(val = false){
    this.setState({
      visible: val
    })
    if(val === false){
      this.setState({
        chatList: [],
        fiInfo: {}
      })
    }
  }
  handleAddChat(msg){
    if(msg['type'] && msg['type'] === 'right'){
      this.handleSendMsg({userId: msg['to'], msg: msg['msg']})
    } else {
      if(this.state.visible === false){
        this.handleSetNewLab(msg['from'])
      }
    }
    this.setState({
      chatList: [...this.state.chatList, msg]
    })
  }
  handleSetFiInfo(fiInfo = {}){
    this.setState({fiInfo})
  }
  handleSendMsgByCustom(type = 'audio'){
    // 自定义消息
    let IMConn = window.IMConn;
    let IMMsg = new WebIM.message('custom', IMConn.getUniqueId());
    let openAudioAndVideo = {
      channel: 'custom_' + Math.round(Math.random()*10), type
    }
    let option = {
      chatType: 'singleChat',    // 会话类型，设置为单聊。
      type: 'custom',               // 消息类型。
      to: this.state.fiInfo['userId'],
      customEvent: 'customEvent',          // 自定义事件。
      customExts: {...openAudioAndVideo},
    }
    IMMsg.set(option)
    console.log('handleSendMsgByCustom option : ', option)
    IMConn.send(IMMsg.body);
    this.handleSendAudioAndVideo({
      ...openAudioAndVideo
    });
  }
  handleSendMsg(sendParam){
    let IMConn = window.IMConn;
    let IMMsg = new WebIM.message('txt', IMConn.getUniqueId());
    let option = {
      chatType: 'singleChat',    // 会话类型，设置为单聊。
      type: 'txt',               // 消息类型。
      to: sendParam['userId'],    // 消息接收方（用户 ID)。
      msg: sendParam['msg'],      // 消息内容。
    }
    IMMsg.set(option)
    console.log('handleSendMsg option : ', option)
    IMConn.send(IMMsg.body);
  }
  render() {
    const {fiInfo, visible, chatList, userInfo} = this.state;
    return (
      <Popup
        visible={visible}
        position='left'
        bodyStyle={{ width: '80%' }}
        closeOnMaskClick
        onClose={this.handleVisible}
      >
        <Card title={fiInfo['userId']}>
          <List style={{height: '500px'}}>
            {
              chatList && chatList.length > 0 ? chatList.map((c, index) => {
                return (
                  <List.Item key={'ccc_' + index} style={{textAlign: c['type'] ? c['type'] : 'left'}}>
                    <div>
                      <span style={{fontSize: '24px'}}>{c['from']}</span>
                    </div>
                    <div>
                      <span style={{fontSize: '15px'}}>{c['msg']}</span>
                    </div>
                  </List.Item>
                )
              }) : <></>
            }
          </List>
          <div style={{position: 'absolute', bottom: '0px', width: '100%'}}>
            <div>
              <Button onClick={() => {
                this.handleSendMsgByCustom('audio');
              }}>语音</Button>
              <Button onClick={() => {
                this.handleSendMsgByCustom('video');
              }} style={{marginLeft: '5px'}}>视频</Button>
            </div>
            <div style={{display: 'flex', justifyItems: 'flex-start'}}>
              <Input id='chatInput' style={{width: '50%'}} placeholder='请输入聊天内容'></Input>
              <Button color='primary' onClick={() => {
                  let msg = document.getElementById('chatInput').value;
                  this.handleAddChat({from: userInfo['userId'], to:fiInfo['userId'], type: 'right', msg});
                }}
                style={{width: '30%', marginLeft: '5px'}}
              >发送</Button>
            </div>
          </div>
        </Card>
      </Popup>
    );
  }
}

export default ChatPage;