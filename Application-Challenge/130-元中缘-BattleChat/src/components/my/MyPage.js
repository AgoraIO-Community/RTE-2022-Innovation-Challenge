import React from "react";
import { Button, Selector, Toast } from 'antd-mobile';
// import AMRT from '../../lib/amrt_h5_v1.0.5/app'

class MyPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      options: [
        {
          label: '男孩',
          value: '1560114268882472960',
        },
        {
          label: '女孩',
          value: '1560114526437904384',
        },
      ],
      defOpVal: "1560114268882472960"
    }
    this.handleSetModel = this.handleSetModel.bind(this);
  }
  componentDidMount(){
    this.handleSetModel(this.state.defOpVal);
  }
  handleSetModel(modelId){
    document.getElementById('container').innerHTML = '';
    const viewer = new window.AMRT.Viewer( 'container', {appkey: 'uZevHVFrSalM', appsecret: 'wHe549Sn2ypUYhrvxCdIQfkMV7RTLODJ'})
    viewer.loadModel(modelId, {
      onLoad: function( m ){
        // console.log('MyPage onLoad : ' + JSON.stringify(m));
        // Toast.show({
        //   icon: 'success',
        //   content: '加载完成',
        // })
      }
    });
  }
  render() {
    const { options, defOpVal } = this.state;
    return (
      <div style={{paddingLeft: '5%', paddingRight: '5%'}}>
        <div>
          <Selector
            options={options}
            defaultValue={[defOpVal]}
            value={[defOpVal]}
            onChange={(arr, extend) => {
              Toast.show({
                icon: 'loading',
                content: '加载中...',
              })
              this.setState({
                defOpVal: arr[0]
              });
              this.handleSetModel(arr[0]);
            }}
          />
        </div>
        <div id="container" style={{width: '80vw', height: '50vh'}}></div>
      </div>
    );
  }
}

export default MyPage;