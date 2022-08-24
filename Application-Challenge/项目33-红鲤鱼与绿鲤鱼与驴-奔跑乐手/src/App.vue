<template>
  <div id="app">
    <BmapCircle msg="Welcome to Your Vue.js App"/>
  </div>
</template>

<script>
import BmapCircle from './components/BmapCircle.vue'
import AgoraRTC from "agora-rtc-sdk-ng"
import { SpatialAudioExtension } from 'agora-extension-spatial-audio'

window.extension = new SpatialAudioExtension({
  assetsPath: './external'
})

window.AgoraRTC = AgoraRTC
// 注册
AgoraRTC.registerExtensions([window.extension])

export default {
  name: 'App',
  mounted() {
  },
  components: {
    BmapCircle,
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
