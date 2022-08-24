/*
 * @Description: 请输入....
 * @Author: Gavin
 * @Date: 2022-08-16 12:00:26
 * @LastEditTime: 2022-08-16 15:48:21
 * @LastEditors: Gavin
 */
// string to Uint8Array
export function stringToUint8Array(str) {
  var arr = []
  for (var i = 0, j = str.length; i < j; ++i) {
    arr.push(str.charCodeAt(i))
  }
  var tmpUint8Array = new Uint8Array(arr)
  return tmpUint8Array
}
// Uint8Array to  string
export function Uint8ArrayToString(fileData) {
  var dataString = ''
  for (var i = 0; i < fileData.length; i++) {
    dataString += String.fromCharCode(fileData[i])
  }
  return dataString
}

// 计算两点距离
export function get(x, y, x2, y2) {
  const dx = Math.abs(x - x2)
  const dy = Math.abs(y - y2)
  var dis = Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2))
  // 去除小数点后的数字，这样看起来舒服
  // console.log("这两点之间的直线距离为:"+parseInt(dis)+"px");
  console.log('disapp', dis)
  return dis
}
// 判断点是否在多边形范围内
export function queryPtInPolygon(x, y, poly) {
  for (var c = false, i = -1, l = poly.length, j = l - 1; ++i < l; j = i) {
    ((poly[i].y <= y && y < poly[j].y) || (poly[j].y <= y && y < poly[i].y)) &&
    (x < (poly[j].x - poly[i].x) * (y - poly[i].y) / (poly[j].y - poly[i].y) + poly[i].x) &&
    (c = !c)
  }
  return c
}

export function getParameterByName(name, url = window.location.href) {
  name = name.replace(/[\[\]]/g, '\\$&');
  var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
      results = regex.exec(url);
  if (!results) return null;
  if (!results[2]) return '';
  return decodeURIComponent(results[2].replace(/\+/g, ' '));
}
