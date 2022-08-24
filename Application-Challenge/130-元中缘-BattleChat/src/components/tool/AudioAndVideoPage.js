import React from "react";
import { Popup, Grid, Avatar, Badge, List, Button } from 'antd-mobile';
import {join, leave, setCallBact, remoteUsers} from '../../utils/rtcFun'
import MediaPlayer from './MediaPlayer';
import {queryListByChannel, saveChannel} from '../../api/channelApi'

class AudioAndVideoPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      visible: false,
      channelForm: null,
      channelUserList: [],
      userInfo: {},
      cameraView: true,
    }
    this.handleCreate = this.handleCreate.bind(this);
    this.handleClose = this.handleClose.bind(this);
    this.handleSetCallBact = this.handleSetCallBact.bind(this);
    this.handleJoin = this.handleJoin.bind(this);
    this.handleLeft = this.handleLeft.bind(this);
    this.handleRefreshAudioList = this.handleRefreshAudioList.bind(this);
    this.handleCameraView = this.handleCameraView.bind(this);
    this.handleUserPublished = this.handleUserPublished.bind(this);

    this.handleAddChannel = props['handleAddChannel'] ? props['handleAddChannel'] : () => {};
  }
  componentWillMount(){
  }
  componentDidMount(){
    this.handleSetCallBact(this.handleUserPublished, this.handleRefreshAudioList, this.handleJoin, this.handleLeft);
  }
  async handleCreate(channelForm){
    let client = window.RtcClient;
    let track = await join(client, channelForm['channel'],undefined , channelForm['channelType']);
    if(channelForm['operation'] === 'add'){
      let messageList = queryListByChannel();
      messageList = messageList ? messageList : []
      let filterList = messageList.filter((c) => {return c['channel'] && c['channel'] === channelForm['channel']});
      if(filterList && filterList.length > 0){
        return;
      }
      let messageListNew = [channelForm, ...messageList];
      saveChannel(messageListNew);
      this.handleAddChannel({...channelForm});
    }
    let userInfo = {
      uid: client.uid,
      hasAudio: channelForm.channelType === 'audio',
      audioTrack: channelForm.channelType === 'audio' ? track : null,
      hasVideo: channelForm.channelType === 'video',
      videoTrack: channelForm.channelType === 'video' ? track : null,
    }
    this.handleRefreshAudioList();
    this.setState({
      channelForm,
      visible: true,
      userInfo
    });
  }
  handleSetCallBact(published, unpublished, joined, left){
    let client = window.RtcClient;
    setCallBact(client, published, unpublished, joined, left);
  }
  handleJoin(user = {}){
    debugger
    console.log("joined success: " + JSON.stringify(user));
    // 用户加入频道
    if(!user){
      return;
    }
    this.handleRefreshAudioList();
  }
  handleLeft(user){
    // 用户离开频道
    this.handleRefreshAudioList();
  }
  async handleClose(){
    const {userInfo} = this.state;
    await leave(window.RtcClient, userInfo['hasAudio'] === true ? userInfo['audioTrack'] : userInfo['videoTrack']);
    this.setState({
      visible: false,
      channelForm: null
    });
  }
  handleUserItemRender(user){
    let isTrue = user['hasAudio'] === true || user['hasVideo'] === true;
    let itemSpan = 1;
    let contentRender = <Avatar src='' style={{ '--size': '70px' }}/>;
    if(user['hasVideo'] === true){
      itemSpan = 4;
      contentRender = <MediaPlayer user={user}/>
    }
    return (
      <Grid.Item key={'ccc_' + user.uid} span={itemSpan}>
        <div className="session-main">
          <div>
            <span style={{fontSize: '12px'}}>{user['uid']}</span>
          </div>
          <Badge
            color={isTrue ? 'green' : 'red'}
            content={Badge.dot}
          >
            {contentRender}
          </Badge>
        </div>
      </Grid.Item>
    )
  }
  async handleUserPublished(user, type){
    let client = window.RtcClient;
    await client.subscribe(user, type);
    this.handleRefreshAudioList();
  }
  handleRefreshAudioList(){
    let client = window.RtcClient;
    this.setState({
      channelUserList: remoteUsers(client)
    })
  }
  handleCameraView(){
    const {userInfo, cameraView} = this.state;
    userInfo['videoTrack'].setEnabled(!cameraView)
    this.setState({
      cameraView: !cameraView
    })
  }
  render() {
    const { visible, channelUserList, userInfo, cameraView } = this.state;
    return (
      <Popup
        visible={visible}
        position='left'
        bodyStyle={{ width: '100%', textAlign: 'center'}}
      >
      <List>
        <List.Item title='自己' extra={<Button size='small' onClick={this.handleCameraView}>{cameraView === true ? '关闭' : '开启'}</Button>}>
          <Grid columns={1} gap={8}>
            {this.handleUserItemRender(userInfo)}
          </Grid>
        </List.Item>
        <List.Item title='他人'>
          <Grid columns={4} gap={8}>
            {
              channelUserList.map((user) => {
                return this.handleUserItemRender(user);
              })
            }
          </Grid>
        </List.Item>
        <List.Item>
          <Button color='warning' onClick={this.handleClose} style={{width: '100%'}}>断开</Button>
        </List.Item>
      </List>
    </Popup>
    );
  }
}

export default AudioAndVideoPage;