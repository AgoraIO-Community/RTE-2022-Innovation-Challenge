import React from "react";
import { Avatar, Button, Input, List, Popup, Toast } from 'antd-mobile';
import { EyeInvisibleOutline, EyeOutline } from "antd-mobile-icons";
import './LoginPage.css'
import LOGO from '../../bc-image/logo100x100.png'
import { removeAll, setToken } from '../../utils/store'

class LoginPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      popupVisible: false,
      user: '',
      pwd: '',
      passwordVisible: false,
    }
    this.handleLogin = this.handleLogin.bind(this);
    this.handlePasswordVisible = this.handlePasswordVisible.bind(this);
    this.handleChangeUser = this.handleChangeUser.bind(this);
    this.handleChangePwd = this.handleChangePwd.bind(this);
    this.handleRegisterUser = this.handleRegisterUser.bind(this);
    this.handlePopupVisible = this.handlePopupVisible.bind(this);
  }
  componentDidMount(){
  }
  handleLogin(){
    const {user, pwd} = this.state;
    let IMConn = window.IMConn;
    IMConn.open({user, pwd, success: (res) => {
      console.log('login success', res);
      Toast.show({
        icon: 'success',
        content: '登陆成功',
      })
      removeAll();
      setToken({...res, userId: user});
      this.handlePopupVisible(false)
    }, error: (res) => {
      console.log('login error', res);
      Toast.show({
        icon: 'fail',
        content: res['data']['message'],
      })
    }});
  }
  handlePasswordVisible(val = false){
    this.setState({
      passwordVisible: val
    })
  }
  handleChangeUser(v){
    this.setState({
      user: v
    })
  }
  handleChangePwd(v){
    this.setState({
      pwd: v
    })
  }
  handleRegisterUser(){
    const {user, pwd} = this.state;
    let IMConn = window.IMConn;
    IMConn.registerUser({username: user, password: pwd, nickname: user, success: (res) => {
      console.log('Register success', res);
      Toast.show({
        icon: 'success',
        content: '注册成功',
      })
      this.handleLogin();
    }, error: (res) => {
      console.log('Register error', res);
      Toast.show({
        icon: 'fail',
        content: res['message'],
      })
    }});
  }
  handlePopupVisible(val = false){
    this.setState({
      popupVisible: val
    })
  }
  render() {
    const { popupVisible, passwordVisible, user, pwd } = this.state;
    return (
      <Popup
        visible={popupVisible}
        position='left'
        bodyStyle={{ width: '100%' }}
      >
        <List style={{textAlign: 'center'}}>
          <List.Item>
            <Avatar src={LOGO}></Avatar>
          </List.Item>
          <List.Item title='用户名'>
            <Input placeholder='请输入用户名' clearable
              value={user} onChange={this.handleChangeUser}></Input>
          </List.Item>
          <List.Item title='密码' extra={
              <div className='eye'>
                {!passwordVisible ? (
                  <EyeInvisibleOutline onClick={() => this.handlePasswordVisible(true)} />
                ) : (
                  <EyeOutline onClick={() => this.handlePasswordVisible()} />
                )}
              </div>
            }>
            <Input placeholder='请输入密码' clearable type={passwordVisible ? 'text' : 'password'}
              value={pwd} onChange={this.handleChangePwd}></Input>
          </List.Item>
          <List.Item>
            <Button color='primary' style={{width: '50%'}} onClick={this.handleLogin}>登陆</Button>
            <Button color='warning' style={{width: '25%'}} onClick={this.handleRegisterUser}>注册</Button>
          </List.Item>
          <List.Item>
            <a>隐私条款</a>
          </List.Item>
        </List>
      </Popup>
    );
  }
}

export default LoginPage;