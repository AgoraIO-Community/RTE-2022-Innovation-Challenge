<script setup lang="ts">
const emit = defineEmits(['update:modelValue'])
interface Props {
  modelValue?: string
  isOwner: Boolean
}
const {
  modelValue,
  isOwner,
} = defineProps<Props>()

const params = $computed(() => {
  const tmp = modelValue?.split('|')
  return {
    appid: tmp[0],
    token: tmp[1],
    channel: tmp[2],
  }
})
const client = AgoraRTC.createClient({ mode: 'live', codec: 'vp8' })
let remoteUsers = {}

async function subscribe(user, mediaType) {
  const uid = user.uid
  // subscribe to a remote user
  await client.subscribe(user, mediaType)
  console.log('subscribe success')
  if (mediaType === 'video') {
    // const player = $(`
    //   <div id="player-wrapper-${uid}">
    //     <p class="player-name">remoteUser(${uid})</p>
    //     <div id="player-${uid}" class="player"></div>
    //   </div>
    // `);
    // $("#remote-playerlist").append(player);
    // user.videoTrack.play(`player-${uid}`, { fit: "contain" });
    user.videoTrack.play('local-player')
  }
  if (mediaType === 'audio')
    user.audioTrack.play()
}

function handleUserPublished(user, mediaType) {
  // print in the console log for debugging
  console.log('"user-published" event for remote users is triggered.')

  const id = user.uid
  remoteUsers[id] = user
  subscribe(user, mediaType)
}

function handleUserUnpublished(user, mediaType) {
  // print in the console log for debugging
  console.log('"user-unpublished" event for remote users is triggered.')

  if (mediaType === 'video') {
    const id = user.uid
    delete remoteUsers[id]
    // $(`#player-wrapper-${id}`).remove()
  }
}

const localTracks = {
  videoTrack: null,
  audioTrack: null,
}

let isJoin = $ref(false)
const doJoin = async(role) => {
  if (role === 'audience') {
    client.setClientRole(role, { level: 1 })
    // add event listener to play remote tracks when remote user publishs.
    client.on('user-published', handleUserPublished)
    client.on('user-unpublished', handleUserUnpublished)
  }
  else {
    client.setClientRole(role)
  }

  // join the channel
  const uid = await client.join(params.appid, params.channel, params.token)
  if (role === 'host') {
    // create local audio and video tracks
    localTracks.audioTrack = await AgoraRTC.createMicrophoneAudioTrack()
    localTracks.videoTrack = await AgoraRTC.createCameraVideoTrack()
    // play local video track
    localTracks.videoTrack.play('local-player')
    // $("#local-player-name").text(`localTrack(${options.uid})`);
    // publish local tracks to channel
    await client.publish(Object.values(localTracks))
  }

  isJoin = true
}

const doLeave = async() => {
  for (const trackName in localTracks) {
    const track = localTracks[trackName]
    if (track) {
      track.stop()
      track.close()
      localTracks[trackName] = undefined
    }
  }

  // remove remote users and player views
  remoteUsers = {}
  // $("#remote-playerlist").html("");

  await client.leave()

  // $("#local-player-name").text("");
  // $("#host-join").attr("disabled", false);
  // $("#audience-join").attr("disabled", false);
  // $("#leave").attr("disabled", true);
  console.log('client leaves channel success')
  isJoin = false
}
</script>
<template>
  <div>
    <div v-if="isJoin" class="flex w-full justify-center items-center">
      <btn-black class="bg-red-400" @click="doLeave">
        Leave
      </btn-black>
    </div>
    <div v-else class="flex w-full justify-center items-center">
      <btn-black v-if="isOwner" @click="doJoin('host')">
        Join as Host
      </btn-black>
      <btn-black v-else @click="doJoin('audience')">
        Join as Audience
      </btn-black>
    </div>
    <div id="local-player" class="player" />
  </div>
</template>

<style lang="stylus" scoped>
  .player {
  width: 100%;
  height: 400px;
}
</style>
