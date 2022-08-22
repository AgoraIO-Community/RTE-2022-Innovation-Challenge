import { Toast } from 'antd-mobile'

export function getStorage (key, type = '') {
  Toast.show({
    icon: 'loading',
    content: '加载中…',
    duration: 500
  })
  let data = localStorage.getItem(key);
  if(data){
    if(type && type === 'json'){
      data = JSON.parse(data);
    }
    return data;
  }
  return '';
}

export function setStorage (key, type = '', value) {
  Toast.show({
    icon: 'loading',
    content: '加载中…',
    duration: 500,
  })
  let val = value;
  if(val){
    if(type && type === 'json'){
      val = JSON.stringify(value);
    }
  } else {
    val = ''
  }
  localStorage.setItem(key, val);
}

export function removeStorage (key) {
  localStorage.removeItem(key)
}

export function removeAll(){
  localStorage.clear();
}

export function setToken(data){
  setStorage('TOKEN_KEY', 'json', data);
}
export function getToken(data){
  return getStorage('TOKEN_KEY', 'json');
}