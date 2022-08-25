import { EventEmitter } from 'events';
import $ from 'jquery/dist/jquery.slim';
import { createTipDom } from './libs/tipDom';
import { createMsg, MSG } from './libs/body';
import tipAudio from './assets/tip.mp3';

export const __CHEAT_SDK_EVENT_EMITTER_NAMES__ =
  '__CHEAT_SDK_EVENT_EMITTER_NAMES__';

export type ConfigType = {
  events: EventNames[];
};
export class CheatSDK {
  readonly _ee: EventEmitter;
  tipDom?: HTMLDivElement;
  audioContext: AudioContext;
  audioSource?: AudioBufferSourceNode;
  audioBuffer?: AudioBuffer;
  constructor(config: ConfigType) {
    this.audioContext = new AudioContext();
    this._ee = new EventEmitter();
    const { events } = config;
    this.initAudio();
    if (events.indexOf(EventNames.mouseleave) > -1) {
      $(document).on('mouseleave', async () => {
        console.log('mouseleave');
        const data = await createMsg(EventNames.mouseleave);
        this._ee.emit(__CHEAT_SDK_EVENT_EMITTER_NAMES__, data);
      });
    }
    if (events.indexOf(EventNames.mouseenter) > -1) {
      $(document).on('mouseenter', async () => {
        console.log('mouseenter');
        const data = await createMsg(EventNames.mouseenter);
        this._ee.emit(__CHEAT_SDK_EVENT_EMITTER_NAMES__, data);
      });
    }
    if (events.indexOf(EventNames.focus) > -1) {
      $(window).on('focus', async () => {
        console.log('focus');
        const data = await createMsg(EventNames.focus);
        this._ee.emit(__CHEAT_SDK_EVENT_EMITTER_NAMES__, data);
      });
    }
    if (events.indexOf(EventNames.blur) > -1) {
      $(window).on('blur', async () => {
        console.log('blur');
        const data = await createMsg(EventNames.blur);
        this._ee.emit(__CHEAT_SDK_EVENT_EMITTER_NAMES__, data);
      });
    }
    if (events.indexOf(EventNames.resize) > -1) {
      $(window).on('resize', async () => {
        console.log('resize');
        const data = await createMsg(EventNames.resize);
        this._ee.emit(__CHEAT_SDK_EVENT_EMITTER_NAMES__, data);
      });
    }
    if (events.indexOf(EventNames.copy) > -1) {
      $(window).on('copy', async () => {
        console.log('copy');
        const data = await createMsg(EventNames.copy);
        this._ee.emit(__CHEAT_SDK_EVENT_EMITTER_NAMES__, data);
      });
    }
    if (events.indexOf(EventNames.cut) > -1) {
      $(window).on('cut', async () => {
        console.log('cut');
        const data = await createMsg(EventNames.cut);
        this._ee.emit(__CHEAT_SDK_EVENT_EMITTER_NAMES__, data);
      });
    }
    if (events.indexOf(EventNames.paste) > -1) {
      $(window).on('paste', async () => {
        console.log('paste');
        const data = await createMsg(EventNames.paste);
        this._ee.emit(__CHEAT_SDK_EVENT_EMITTER_NAMES__, data);
      });
    }
    if (events.indexOf(EventNames.select) > -1) {
      $(window).on('mouseup', async () => {
        const getSelection = window.getSelection;
        if (!!getSelection) {
          if (getSelection()?.getRangeAt(0)?.toString()) {
            console.log('selectionchange');
            const data = await createMsg(EventNames.select);
            this._ee.emit(__CHEAT_SDK_EVENT_EMITTER_NAMES__, data);
          }
        }
      });
    }
    if (events.indexOf(EventNames.online) > -1) {
      $(window).on('online', async () => {
        console.log('online');
        const data = await createMsg(EventNames.online);
        this._ee.emit(__CHEAT_SDK_EVENT_EMITTER_NAMES__, data);
      });
    }
    if (events.indexOf(EventNames.offline) > -1) {
      $(window).on('offline', async () => {
        console.log('offline');
        const data = await createMsg(EventNames.offline);
        this._ee.emit(__CHEAT_SDK_EVENT_EMITTER_NAMES__, data);
      });
    }
    if (
      events.indexOf(EventNames.exitfullscreen) > -1 ||
      events.indexOf(EventNames.exitfullscreen) > -1
    ) {
      const getIsFullScreen = async () => {
        const { availHeight, availWidth, width, height } = window.screen;
        if (availHeight === height && availWidth === width) {
          const data = await createMsg(EventNames.enterfullscreen);
          this._ee.emit(__CHEAT_SDK_EVENT_EMITTER_NAMES__, data);
        } else {
          const data = await createMsg(EventNames.exitfullscreen);
          this._ee.emit(__CHEAT_SDK_EVENT_EMITTER_NAMES__, data);
        }
      };
      getIsFullScreen();
      $(document).on('fullscreenchange', async () => {
        console.log('fullscreenchange');
        getIsFullScreen();
      });
      $(window).on('resize', async () => {
        console.log('fullscreenchange resize');
        getIsFullScreen();
      });
    }
    console.log('实例化');
  }
  showTip = (notPlayAudio?: boolean) => {
    if (!!this.tipDom) {
    } else {
      if (notPlayAudio !== true) {
        // this.playAudio();
      }
      this.tipDom = createTipDom();
      document.getElementsByTagName('body')[0].appendChild(this.tipDom);
    }
  };
  hideTip = () => {
    if (!!this.tipDom) {
      this.tipDom?.remove();
      this.tipDom = undefined;
    }
    this.stopAudio();
  };
  on = (listener: (data: MSG) => void) => {
    this._ee.on(__CHEAT_SDK_EVENT_EMITTER_NAMES__, listener);
  };
  off = (listener: (data: MSG) => void) => {
    this._ee.off(__CHEAT_SDK_EVENT_EMITTER_NAMES__, listener);
  };
  destroy = () => {
    this.hideTip();
    this._ee.removeAllListeners(__CHEAT_SDK_EVENT_EMITTER_NAMES__);
    this.audioContext?.close();
    this.audioSource = undefined;
  };
  initAudio = async () => {
    try {
      const context = this.audioContext;
      if (!this.audioBuffer) {
        window
          .fetch(tipAudio)
          .then((response) => response.arrayBuffer())
          .then((arrayBuffer) => context.decodeAudioData(arrayBuffer))
          .then((audioBuffer) => {
            const source = context.createBufferSource();
            source.buffer = audioBuffer;
            source.connect(context.destination);
            source.loop = true;
            this.audioBuffer = audioBuffer;
            this.audioSource = source;
          });
      } else {
        this.stopAudio();
        const source = context.createBufferSource();
        source.buffer = this.audioBuffer;
        source.connect(context.destination);
        source.loop = true;
        this.audioBuffer = this.audioBuffer;
        this.audioSource = source;
      }
    } catch (error) {}
  };
  playAudio = () => {
    try {
      this.initAudio();
      const context = this.audioContext;
      const audioSource = this.audioSource;
      if (context && audioSource) {
        audioSource.loop = true;
        audioSource.start();
      }
    } catch (error) {}
  };
  stopAudio = () => {
    try {
      const context = this.audioContext;
      const audioSource = this.audioSource;
      if (context && audioSource) {
        audioSource.stop(); //立即停止
      }
    } catch (error) {}
  };
}

/**
 * 监听事件名
 * https://developer.mozilla.org/zh-CN/docs/Web/Events
 */
export enum EventNames {
  'mouseenter' = 'mouseenter',
  'mouseleave' = 'mouseleave',
  'focus' = 'focus',
  'blur' = 'blur',
  'resize' = 'resize',
  'copy' = 'copy',
  'cut' = 'cut',
  'paste' = 'paste',
  'select' = 'select',
  'online' = 'online',
  'offline' = 'offline',
  'exitfullscreen' = 'exitfullscreen',
  'enterfullscreen' = 'enterfullscreen',
}
const testCheat = new CheatSDK({
  events: Object.values(EventNames),
});
console.log(Object.values(EventNames));
testCheat.on((data) => {
  console.log();
  console.log();
  console.log('=============================================');
  console.log('=============================================');
  console.log();
  console.log('testCheat: ', data);
  console.log();
  console.log('=============================================');
  console.log('=============================================');
  console.log();
  console.log();
});
export default CheatSDK;
