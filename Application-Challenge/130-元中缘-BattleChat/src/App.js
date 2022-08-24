import React from "react";
import {Route} from 'react-router-dom';
import {Redirect, Switch, withRouter} from 'react-router';
import battleChatLog from './bc-image/logo100x100.png';
import './App.css';
import TabPage from './components/home/TabPage';
import InitPage from './components/init/InitPage'

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isView: true
    }
  }
  componentDidMount(){
    const _this = this;
    setTimeout(function(){
      _this.setState({
        isView: false
      })
    }, 1000)
  }
  render() {
    const { isView } = this.state;
    return (
      <div className="App">
        {
          isView ? (
            <header className="App-header">
              <img src={battleChatLog} className="App-logo" alt="logo" />
            </header>
          ) : <span></span>
        }
        <Switch>
          <Route exact path='/home' component={TabPage}/>
          <Route exact path='/other' component={InitPage}/>
          <Redirect to="/home"/>
        </Switch>
      </div>
    );
  }
}

export default withRouter(App);
