import {setStorage, getStorage} from '../utils/store';

const FI = 'FI_';

const MESSAGE_KEY = FI + 'MESSAGE_KEY';
const FI_USER_KEY = FI + 'FI_USER_KEY';

function queryMessage(){
  return getStorage(MESSAGE_KEY, 'json');
}
function saveMessage(data){
  setStorage(MESSAGE_KEY, 'json', data);
}

function queryFiUserList(){
  return getStorage(FI_USER_KEY, 'json');
}
function saveFiUser(data){
  setStorage(FI_USER_KEY, 'json', data);
}

export {
  queryMessage,
  saveMessage,
  queryFiUserList,
  saveFiUser,
}