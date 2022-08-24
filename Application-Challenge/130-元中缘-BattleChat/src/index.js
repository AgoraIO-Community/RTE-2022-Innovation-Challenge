import React from "react";
import ReactDOM from "react-dom";
import {BrowserRouter} from 'react-router-dom';
import App from "./App";
import history from './utils/my-history';
import AgoraRTC from "agora-rtc-sdk-ng";
import WebIM from 'easemob-websdk'

class BattleChat extends React.PureComponent{
	constructor(props){
		super(props);
		window.RtcClient = AgoraRTC.createClient({ codec: 'h264', mode: 'rtc' });
		WebIM.conn = new WebIM.connection({appKey: '1187220728096754#demo'});
		window.IMConn = WebIM.conn;
		this.state = {
		}
	}
  componentDidMount(){
  }
  render(){
  	return (
    	<BrowserRouter history={history}>
    	 <App/>
    	</BrowserRouter>
  	);
  }
}

ReactDOM.render(<BattleChat/>, document.getElementById("root"));