<template>
  <div class="hello">
<!--    <button @click="move">Mode</button>-->
<!--    <button @click="addPlane">Plane</button>-->
    <select v-model="musicSelected">
      <option value="/music/awbz.m4a">爱我别走</option>
      <option value="/music/dwz.m4a">带我走</option>
      <option value="/music/zm.m4a">走马</option>
      <option value="/music/yrybz.aac">易燃易爆炸</option>
    </select>
    <button @click="playMusic">播放音乐（本人听不见）</button>
    <label>
      <input type="number" step="5" v-model="userPosition.speed">
    </label>
    <button @click="startRunning">开始跑步</button>
    <button @click="reverseRunning">反向跑步</button>
    <button @click="stopRunning">停止跑步</button>
    <baidu-map
        :zoom="18"
        :center="center"
        :scroll-wheel-zoom="true"
        style="width: 1000px; height: 800px">
      <bm-marker v-for="user in users"
                   :key="user.key"
                   :ref = "'user' + user.key"
                   :id = "'user' + user.key"
                   :position="user"
      >
       <bm-label :content="user.userPosition.npc"></bm-label>
      </bm-marker>
      <bm-marker :position="userPosition"
                 v-on:dragend="handleSelfDragEnd( ...arguments)"
                 :dragging="true"
                 :zIndex="10"
      >
        <bm-label :content="nickname"></bm-label>
      </bm-marker>
      <bm-marker v-for="airplane in airplanes"
                 :key="airplane.key"
                 :ref = "'airplane' + airplane.key"
                 :id = "'airplane' + airplane.key"
                 :position="airplane.position"
                 :icon="airplane.icon"
      ></bm-marker>
    </baidu-map>
  </div>
</template>

<script>

import AgoraRTC from "agora-rtc-sdk-ng"

import {stringToUint8Array, Uint8ArrayToString, queryPtInPolygon, get, getParameterByName} from '../utils/index.js'

let nickname = getParameterByName("nickname")
while (!nickname){
  nickname = prompt("请输入您的姓名")
}
console.log("nickname", nickname)

const AGORA_FACTOR = 500

const jiangwanPathOrigin = [
  // 上圆
  [121.520877,31.312539],
  [121.521052,31.313121],
  [121.521308,31.313322],
  [121.521901,31.313434],
  [121.522462,31.31321],
    //右线
  [121.522669,31.312894],
  [121.522902,31.312543],
  [121.5231,31.312161],
  [121.52328,31.311822],
  //下圆
  [121.523248,31.31129],
  [121.522866,31.310935],
  [121.522417,31.310808],
  [121.521766,31.311],
  //左线
  [121.521487,31.311378],
  [121.521294,31.311729],
  [121.52124,31.311818],
  [121.521007,31.312231],
]

const jiangwanPath = jiangwanPathOrigin.map((position)=>{
  return {
    lng: position[0],
    lat: position[1],
  }
})
jiangwanPath.push(jiangwanPath[0])
console.log("jiangwanPath", jiangwanPath)

const jiangwanPathInfo = {
  sum: 0,
  point: [],
}

for (let i = 0; i < jiangwanPath.length - 1; i++){
  let cur = jiangwanPath[i]
  let next = jiangwanPath[i+1]
  let dep = Math.sqrt(Math.pow((cur.lat - next.lat), 2) + Math.pow((cur.lng - next.lng), 2));
  jiangwanPathInfo.sum += dep
  jiangwanPathInfo.point.push({
    lat: cur.lat,
    lng: cur.lng,
    dep,
    depToStart: jiangwanPathInfo.sum
  })
}

const fps = 30
const updateFps = 5

let airplaneCnt = 100

const getRandomJiangwanPosition = function(){
  const i = Math.floor(Math.random()* jiangwanPath.length)
  const target = (i + 1) % jiangwanPath.length
  const data = JSON.parse(JSON.stringify(jiangwanPath[i]))
  data.target = target
  return data
}

const userInitPosition = getRandomJiangwanPosition()

const SPEED_CONST = 0.0003

export default {
  name: 'BmapCircle',
  data() {
    window.bmapData = this
    return {
      nickname,
      musicSelected: "/music/awbz.m4a",
      center: {
        lng: 121.522075,
        lat: 31.312155
      },
      remoteUsers: {},
      options: {
        appid: "63bde92edf39418b81ee08cadf57d77c",
        channel: "derek123",
        uid: null,
        token: null
      },
      jiangwanPath: JSON.parse(JSON.stringify(jiangwanPath)),
      a: { // 画布 top 0,0
        x: 1132,
        y: 212
      },
      b: { // 画布 right
        x: 2272,
        y: 865
      },
      c: { // 画布bo
        x: 1135,
        y: 1522
      },
      d: { // 画布left
        x: 0,
        y: 866
      },
      vector: 50 / 350, // 向量用来手动静音
      // 屏幕信息
      screenParm: {
        width: '',
        height: ''
      },
      // 用户位置
      userPosition: {
        // top:2850,
        // left:2300,
        target: userInitPosition.target,
        top: userInitPosition.lng,
        left: userInitPosition.lat,
        speed: 1,
        lng: userInitPosition.lng,
        lat: userInitPosition.lat,
        direction: 0, // 人物面部角度
        rightvector: [-1, -1, 0], // 右手
        vector: [1, -1, 0], // 面部朝向
        npc: nickname,
        factor: 50, // 展示
        position: [userInitPosition.lng, userInitPosition.lat, 1]// 转换xyz 2.5D
      },
      extension: window.extension,
      users: [],
      airplanes: [
      //     {
      //   key: airplaneCnt++,
      //   name: "airplane",
      //   icon: {
      //     url: '/airplane.png',
      //     size: {
      //       width: 50,
      //       height: 50
      //     },
      //   },
      //   position: JSON.parse(JSON.stringify(jiangwanPath[1]))
      // }
      ]
    }
  },
  mounted() {
    bmapData.extension = window.extension
    this.init()
  },
  methods: {
    async init(){
      this.client = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' })
      await this.join()
    },
    async join() {
      await this.client.on('user-published', this.handleUserPublished)
      await this.client.on('user-unpublished', this.handleUserUnpublished)
      await this.client.on('stream-message', this.handleUsermessage)
      this.options.uid = await this.client.join(this.options.appid, this.options.channel, this.options.token)
      let position = [this.userPosition.position[0] * AGORA_FACTOR, this.userPosition.position[1] * AGORA_FACTOR, this.userPosition.position[2]]
      this.extension.updateSelfPosition(position, [-1, -1, 0], [1, -1, 0], [0, 0, 1])
      position = null

      this.client.sendStreamMessage(stringToUint8Array(JSON.stringify({
        userPosition: this.userPosition
      })))
      if (getParameterByName("publish") === "no"){
      }else{
        console.log("开始发布")
        this.localUserTrack = await AgoraRTC.createMicrophoneAudioTrack({
          AEC: true,
          AGC: true,
          ANS: true
        })
        // 通过在线音乐创建音频轨道。
        this.audioFileTrack = await AgoraRTC.createBufferSourceAudioTrack({
          source: this.musicSelected,
        });
        await this.client.publish([this.localUserTrack, this.audioFileTrack])
        console.error("发布成功")
      }
      // console.log(this.remoteUsers)
      // if(!this.settingData['Jessica'].processor&&!this.settingData['Dave'].processor){
      //    await this.mockRemoteUserJoin(); //mock AI Denoiser
      // }
      // setTimeout( async ()=>{

      // pos 2.5D 自己空间音频的位置
      const pos = this.getVector(this.userPosition.left, this.userPosition.top)
      // console.log("user=",pos)
      // },4000)
    },
    playMusic(){
      if (this.isPlayingMusic){
        this.audioFileTrack.stopProcessAudioBuffer();
        this.isPlayingMusic = false
      }else{
        this.audioFileTrack.startProcessAudioBuffer({
          loop: true,
        });
        this.isPlayingMusic = true
      }
    },
    startRunning(){
      this.userPosition.speed = Math.abs(this.userPosition.speed)
      if (!this.userPosition.speed){
        this.userPosition.speed = 1
      }
      if (this.isRunning){
      }else{
        this.isRunning = true
        this.move()
      }
    },
    reverseRunning(){
      this.userPosition.speed = - Math.abs(this.userPosition.speed)
      if (!this.userPosition.speed){
        this.userPosition.speed = -1
      }
      if (this.isRunning){
      }else{
        this.isRunning = true
        this.move()
      }
    },
    stopRunning(){
      this.userPosition.speed = 0
    },
    created() {
      // AgoraRTC.registerExtensions([this.extension]);
      // this.denoiser = window.denoiser;
      this.previous = new Date().getTime()
    },
    // 获取2.5d 坐标
    getVector(x, y) {
      const xx = this.getJuLiX(x, y)
      const yy = this.getJuLiY(x, y)
      return {
        x: Number((this.vector * xx).toFixed(2)),
        y: Number((this.vector * yy).toFixed(2))
      }
    },
    // 2.d  真实坐标y
    getJuLiY(x, y) {
      var len
      var A = (this.a.y - this.b.y) / (this.a.x - this.b.x)
      var B = this.a.y - A * this.a.x
      len = Math.abs(((A * x + B - y).toFixed(2)) / Math.sqrt(A * A + 1)) * Math.sin(Math.PI / 3).toFixed(2)
      // console.log(len)
      return len
    },
    // 2.d 真实坐标x
    getJuLiX(x, y) {
      var len
      var A = (this.a.y - this.d.y) / (this.a.x - this.d.x)
      var B = this.a.y - A * this.a.x
      len = Math.abs(((A * x + B - y).toFixed(2)) / Math.sqrt(A * A + 1)) * Math.sin(Math.PI / 3).toFixed(2)
      // console.log(len)
      return len
    },
    handleDragEnd: function(user, evt){
      console.log("handleDragEnd",user, evt)
      user.position.lat = evt.point.lat
      user.position.lng = evt.point.lng
    },
    handleSelfDragEnd: function(evt){
      console.log("handleDragEnd", evt)
      this.userPosition.top = evt.point.lng
      this.userPosition.left = evt.point.lat
      this.userPosition.position[0] = evt.point.lng
      this.userPosition.position[1] = evt.point.lat
      this.lng = evt.point.lng
      this.lat = evt.point.lat
      let position = [this.userPosition.position[0] * AGORA_FACTOR, this.userPosition.position[1] * AGORA_FACTOR, this.userPosition.position[2]]
      this.extension.updateSelfPosition(position, [-1, -1, 0], [1, -1, 0], [0, 0, 1])
      this.client.sendStreamMessage(stringToUint8Array(JSON.stringify({
        userPosition: this.userPosition
      })))
      console.error("updateSelfPosition", this.userPosition.position, position)
      position = null
    },
    moveOneStep: function(){
      const user = this.userPosition
      let target = jiangwanPath[user.target]
      if (parseInt(user.speed) === 0){
        return
      }
      console.error("speed", user.speed)
      let dep = Math.sqrt(Math.pow((user.lat - target.lat), 2) + Math.pow((user.lng - target.lng), 2));
      const moveDep = Math.abs(user.speed * SPEED_CONST / fps)
      // console.error(`dep`, dep, "speed", user.speed, "moveDep", moveDep)
      if (moveDep > dep){
        // 下一个点
        if (user.speed > 0){
          user.target = (user.target+1) % jiangwanPath.length
        }else{
          user.target = (user.target + jiangwanPath.length - 1) % jiangwanPath.length
        }
        dep = Math.sqrt(Math.pow((user.lat - target.lat), 2) + Math.pow((user.lng - target.lng), 2));
      }
      // const lastPosition = [user.position[0], user.position[1]]
      // 往target方向挪
      const newPosition = {
        lat: user.lat + (target.lat - user.lat) / dep * moveDep,
        lng: user.lng + (target.lng - user.lng) / dep * moveDep,
      }
      // console.log(`lastPosition`, lastPosition, "newPosition", newPosition)
      // 刷新ui
      // Here
      if (newPosition.lat){
        user.lat = newPosition.lat
        user.lng = newPosition.lng
      }
      user.position[0] = newPosition.lng
      user.position[1] = newPosition.lat
      if (!user.move){
        user.move = 1
      }else{
        user.move++
      }
      if (user.move % (fps / updateFps) === 0){
        let position = [this.userPosition.position[0] * AGORA_FACTOR, this.userPosition.position[1] * AGORA_FACTOR, this.userPosition.position[2]]
        this.extension.updateSelfPosition(position, [-1, -1, 0], [1, -1, 0], [0, 0, 1])
        this.client.sendStreamMessage(stringToUint8Array(JSON.stringify({
          userPosition: this.userPosition
        })))
        position = null
      }
    },
    move: async function(){
      setInterval(()=>{
        this.moveOneStep()
      }, 1000 / fps)
    },
    addPlane: async function(){
      const airplane = {
        key: airplaneCnt++,
        name: "airplane",
        icon: {
          url: '/airplane.png',
          size: {
            width: 50,
            height: 50
          },
        },
        position: JSON.parse(JSON.stringify(jiangwanPath[0]))
      }
      this.airplanes.push(airplane)
      console.log("addAirplane", airplane)
    },
    // 处理用户加入回调 第三方加入频道 人物初始化
    async handleUserPublished(user, mediaType) {
      // console.log('subscribe success', this.extension)
      const processor = this.extension.createProcessor()
      user.processor = processor
      // console.log(user)
      user.npc = user.uid
      this.remoteUsers[user.uid] = user
      await this.client.subscribe(user, mediaType)
      const track = user.audioTrack
      if (track){
        track.pipe(processor).pipe(track.processorDestination)
        track.setVolume(100)
        track.play()
      }
      if (![1000, 1001].includes(user.uid)) {
        // user.top = 2850;
        // user.left = 2300;
        // let pos = this.getVector(user.left,user.top)
        // user.position = [pos.x,pos.y,1];
        // user.direction = 0;
        this.remoteUsers[user.uid].track = track
        this.$forceUpdate()
        // console.log(this.remoteUsers)
      } else {
        console.log('mock user join')
      }
    },

    handleUserUnpublished() {

    },
    // 处理消息回调 其他人行为
    async handleUsermessage(uid, data) {
      // 别人发送的消息cb
      const detail = JSON.parse(Uint8ArrayToString(data))
      console.error("XXX uid", uid, "detail", detail)
      let user = this.users.find((user)=>{
        return user.key === uid
      })
      if (!user){
        user = {
          key: uid,
          userPosition: detail.userPosition,
          lng: detail.userPosition.position[0],
          lat: detail.userPosition.position[1],
        }
        this.users.push(user)
      }else{
        user.lng = detail.userPosition.position[0]
        user.lat = detail.userPosition.position[1]
      }
      // console.log(detail)
      if (detail.isSetAins) {
        this.setAins(detail.value, detail.npc)
      } else {
        if (this.nickname === detail.npc){
          return
        }
        let start  = Date.now()
        while (!this.remoteUsers[uid]){
          await new Promise((res)=>{
            setTimeout(res, 200)
          })
          if (Date.now() - start > 5000){
            console.error("No remote user ", uid)
            return
          }
        }
        let position = [detail.userPosition.position[0] * AGORA_FACTOR, detail.userPosition.position[1] * AGORA_FACTOR, 1]
        console.error("updateRemotePosition", uid, position)
        this.remoteUsers[uid].processor.updateRemotePosition({
          position: position,
          forward: detail.userPosition.vector
        })
        position = null
        this.remoteUsers[uid].top = detail.userPosition.top
        this.remoteUsers[uid].left = detail.userPosition.left
        this.remoteUsers[uid].direction = detail.userPosition.direction
        this.remoteUsers[uid].npc = detail.userPosition.npc
        this.remoteUsers[uid].position = detail.userPosition.position
        this.remoteUsers[uid].lng = detail.userPosition.position[0]
        this.remoteUsers[uid].lat = detail.userPosition.position[1]

        // if (get(this.userPosition.position[0], this.userPosition.position[1], detail.userPosition.position[0], detail.userPosition.position[1]) > 50) {
        //   this.remoteUsers[uid].track.setVolume(0)
        // } else {
        //   this.remoteUsers[uid].track.setVolume(100)
        // }
        // if(detail.time){
        //   document.querySelector('.remoteUser'+ uid).style.transition  = 'all '+detail.time+'s linear'
        // }else{
        //   document.querySelector('.remoteUser'+ uid).style.transition  = ''
        // }
        // console.log(this.remoteUsers[uid].processor)
      }
      this.$forceUpdate()
    },
  },
  props: {
    msg: String
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h3 {
  margin: 40px 0 0;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}
</style>
