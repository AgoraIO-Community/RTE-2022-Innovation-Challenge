import React from "react";
import { Card, Collapse, Toast, SwipeAction, Grid, Popup, List, Button, Input, Picker, Modal, Space, Radio } from 'antd-mobile'
import {AddOutline} from 'antd-mobile-icons'
import './HomePage.css'
import {queryListByGroup, queryListByChannel, queryConfig, saveConfig, saveGroup, saveChannel} from '../../api/channelApi'
import {getToken} from '../../utils/store'
import AudioAndVideoPage from '../tool/AudioAndVideoPage'
import LoginPage from '../login/LoginPage'

class HomePage extends React.Component {
  constructor(props) {
    super(props);
    let config = queryConfig();
    this.state = {
      // 组别['', '', '']
      groupList: [],
      // 默认组别位置 top/bottom
      config: {
        groupDefLocal: 'top',
        ...config
      },
      // 频道列表
      messageList:[],
      channelForm: {
        channel: '',
        groupName: '默认',
        channelType: 'audio', // audio/video
        operation: '', // add/join
        track: null,
      },
      visibleAddChannel: false,
      visibleGroup: false,
      visibleAddGroup: false,
      groupNameAdd: ''
    }
    this.handleOpenSession = this.handleOpenSession.bind(this);
    this.handleAddGroup = this.handleAddGroup.bind(this);
    this.handleDefLocal = this.handleDefLocal.bind(this);
    this.handleVisibleAddChannel = this.handleVisibleAddChannel.bind(this);
    this.handleVisibleGroup = this.handleVisibleGroup.bind(this);
    this.handleSetChannelForm = this.handleSetChannelForm.bind(this);
    this.handleRenderItem = this.handleRenderItem.bind(this);
    this.handleAddChannel = this.handleAddChannel.bind(this);
    this.handleCheckChannel = this.handleCheckChannel.bind(this);
  }
  componentDidMount(){
    let token = getToken();
    if(!token || !token['access_token']){
      this.refs['LoginPageRef']['handlePopupVisible'](true);
      return;
    } else {
      let IMConn = window.IMConn;
      if(IMConn.isOpened() === false){
        this.refs['LoginPageRef']['handlePopupVisible'](true);
        return;
      }
    }
    let groupList = queryListByGroup();
    let messageList = queryListByChannel();
    this.setState({
      groupList: groupList ? groupList : [],
      messageList: messageList ? messageList : []
    })
  }
  handleOpenSession(item){
    let msg = this.handleCheckChannel(item);
    if(msg){
      Toast.show({
        icon: 'fail',
        content: msg,
      })
      return;
    }
    this.handleVisibleAddChannel(false);
    this.refs['AudioAndVideoPageRef'].handleCreate(item);
  }
  handleAddGroup(){
    let val = this.state.groupNameAdd;
    let groupListNew = this.state.groupList ? this.state.groupList : [];
    let filterList = groupListNew.filter((v) => v === val);
    if(filterList && filterList.length > 0){
      Toast.show({
        icon: 'fail',
        content: '组名已存在',
      })
      return;
    }
    groupListNew.push(val);
    saveGroup(groupListNew);
    this.setState({
      groupList: groupListNew
    })
  }
  handleDefLocal(){
    const {config} = this.state;
    let configNew = {
      ...config,
      groupDefLocal : config.groupDefLocal === 'top' ? 'bottom' : 'top'
    }
    saveConfig(configNew);
    this.setState({
      config: configNew
    })
  }
  handleVisibleAddChannel(val, groupName){
    if(val === true){
      this.setState({
        channelForm: {
          channel: '',
          groupName: groupName,
          channelType: 'audio', // audio/video
          operation: '', // add/join
          track: null,
        }
      })
    }
    this.setState({
      visibleAddChannel: val
    })
  }
  handleAddChannel(){
    this.setState({
      messageList: queryListByChannel()
    })
  }
  handleCheckChannel(channelForm){
    let msg = null;
    if(!channelForm || !channelForm['channelType']){
      msg = '类型不能为空';
    } else if(!channelForm['channel']){
      msg = '渠道不能为空';
    }
    if(channelForm['operation'] && channelForm['operation'] === 'add'){
      const messageList = this.state.messageList;
      let filterList = messageList.filter((m) => m['channel'] === channelForm['channel']);
      if(filterList && filterList.length > 0){
        msg = '渠道已存在';
      }
    }
    return msg;
  }
  handleVisibleGroup(val){
    this.setState({
      visibleGroup: val
    })
  }
  handleSetChannelForm(data){
    this.setState({
      channelForm: {
        ...this.state.channelForm,
        ...data
      }
    })
  }
  handleVisibleAddGroup(val){
    this.setState({
      visibleAddGroup: val,
      groupNameAdd: ''
    })
  }
  handleRenderItem(groupName = '默认'){
    return (
      <Collapse.Panel key={groupName} title={groupName}>
        <Grid columns={3} gap={8}>
          <Grid.Item key={'ddd_def'} onClick={() => {this.handleVisibleAddChannel(true, groupName)}}>
            <Card className="card-item" title='进入'>
              <AddOutline fontSize={24}/>
            </Card>
          </Grid.Item>
          {
            this.state.messageList.filter((item) => item['groupName'] === groupName).map((item, index) => {
              return (
                <Grid.Item key={'ddd_' + index} onClick={() => {this.handleOpenSession({...item, operation: 'join'})}}>
                  <Card className="card-item" title={item['channelType']}>
                    {item['channel']}
                  </Card>
                </Grid.Item>
              )
            })
          }
        </Grid>
      </Collapse.Panel>
    )
  }
  render() {
    const { groupList, config: {groupDefLocal}, visibleAddChannel, visibleGroup, channelForm, visibleAddGroup, groupNameAdd } = this.state;
    return (
      <div style={{height: '100%'}}>
        <AudioAndVideoPage ref='AudioAndVideoPageRef' handleAddChannel={this.handleAddChannel}/>
        <LoginPage ref='LoginPageRef'/>
        <Popup
          visible={visibleAddChannel}
          position='left'
          bodyStyle={{ width: '100%' }}
        >
          <Modal
            visible={visibleAddGroup}
            transparent
            closeOnMaskClick
            closable
            onClose={() => {
              this.handleVisibleAddGroup(false);
            }}
            title="组别添加"
            style={{width: '70%', height: '500px'}}
            content={
              <List>
                <List.Item title='组别名称'>
                  <Input placeholder='请输入组别名称' value={groupNameAdd} onChange={(v) => {
                    this.setState({
                      groupNameAdd: v
                    })
                  }}></Input>
                </List.Item>
                <List.Item>
                  <Button color='primary' onClick={() => {
                    this.handleAddGroup()
                    this.handleSetChannelForm({groupName: this.state.groupNameAdd});
                    this.handleVisibleAddGroup(false);
                  }}>确定</Button>
                </List.Item>
              </List>
            }
          >
          </Modal>
          <Picker
            columns={[[...[{label: '默认', value: '默认'}], ...groupList.map((s) => {return {label: s, value: s}})]]}
            visible={visibleGroup}
            onClose={() => {this.handleVisibleGroup(false)}}
            onConfirm={v => {
              this.handleSetChannelForm({groupName: v})
            }}
          />
          <List>
            <List.Item title='分组' extra={<Button size="small" color='primary' onClick={() => {this.handleVisibleAddGroup(true)}}>添加分组</Button>}>
              <Input
                placeholder='请选择分组'
                defaultValue={channelForm.groupName ? channelForm.groupName : '默认'}
                value={channelForm.groupName}
                onClick={() => {this.handleVisibleGroup(true)}}
              />
            </List.Item>
            <List.Item title='类型'>
              <Radio.Group defaultValue='audio' value={channelForm.channelType} onChange={(v) => {
                this.handleSetChannelForm({channelType: v})
              }}>
                <Space direction='vertical'>
                  <Radio value='audio'>音频轨道</Radio>
                  <Radio value='video'>视频轨道</Radio>
                </Space>
              </Radio.Group>
            </List.Item>
            <List.Item title='渠道'>
              <Input placeholder='请输入渠道' value={channelForm.channel} onChange={(v) => {
                this.handleSetChannelForm({channel: v})
              }}/>
            </List.Item>
            <List.Item style={{textAlign: 'center'}}>
              <Button color='primary' onClick={() => {
                this.handleOpenSession({...this.state.channelForm, operation: 'add'});
              }} style={{width: '80%'}}>进入</Button>
            </List.Item>
            <List.Item style={{textAlign: 'center'}}>
              <Button color='warning' onClick={() => {
                this.handleVisibleAddChannel(false)
              }} style={{width: '80%'}}>取消</Button>
            </List.Item>
          </List>
        </Popup>
        <List>
          <SwipeAction
            rightActions={[
              {
                key: 'local',
                text: groupDefLocal === 'bottom' ? '移到顶部' : '移到底部',
                color: 'danger',
                onClick: this.handleDefLocal,
              },
            ]}
          >
            <Collapse accordion defaultActiveKey='默认' style={{textAlign: 'left'}}>
              {
                groupDefLocal && groupDefLocal === 'top' ? this.handleRenderItem() : <span></span>
              }
              {
                groupList.map((groupName) => {return this.handleRenderItem(groupName);})
              }
              {
                groupDefLocal && groupDefLocal === 'bottom' ? this.handleRenderItem() : <span></span>
              }
            </Collapse>
          </SwipeAction>
        </List>
      </div>
    );
  }
}

export default HomePage;