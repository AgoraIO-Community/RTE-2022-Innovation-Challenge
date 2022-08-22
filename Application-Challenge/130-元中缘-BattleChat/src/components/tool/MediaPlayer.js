import React from "react";

class MediaPlayer extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      userInfo: props['user'] ? props['user'] : {}
    }
  }
  componentDidMount(){
    const {userInfo} = this.state;
    let divElement = document.getElementById('video_' + userInfo['uid']);
    if(userInfo && userInfo['videoTrack'] && divElement){
      userInfo.videoTrack['play'](divElement);
    }
  }
  render() {
    const {userInfo} = this.state;
    return (
      <div id={'video_' + userInfo['uid']} style={{ width: "250px", height: "150px"}}>
      </div>
    );
  }
}

export default MediaPlayer;