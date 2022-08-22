import {setStorage, getStorage} from '../utils/store';

const CHANNEL = 'CHANNEL_';

const CONFIG_KEY = CHANNEL + 'ONFIG_KEY';
const CHANNEL_LIST_KEY = CHANNEL + 'CHANNEL_LIST_KEY';
const GROUP_LIST_KEY = CHANNEL + 'GROUP_LIST_KEY';

function queryConfig(){
  return getStorage(CONFIG_KEY, 'json');
}
function saveConfig(data){
  setStorage(CONFIG_KEY, 'json', data);
}

function queryListByGroup(){
  return getStorage(GROUP_LIST_KEY, 'json');
}
function saveGroup(data){
  setStorage(GROUP_LIST_KEY, 'json', data);
}

function queryListByChannel(){
  return getStorage(CHANNEL_LIST_KEY, 'json');
}

function saveChannel(data = {}){
  setStorage(CHANNEL_LIST_KEY, 'json', data);
}

export {
  queryConfig,
  saveConfig,
  queryListByGroup,
  saveGroup,
  queryListByChannel,
  saveChannel
}