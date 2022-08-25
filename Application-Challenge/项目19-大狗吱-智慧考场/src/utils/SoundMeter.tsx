import { EventEmitter } from 'events';
import lodash from 'lodash';

const __SoundMeter_event__ = '__SoundMeter_event__';
/**
 * 实时音频音量
 */
export type StreamAudioMeter = {
  /**
   * 实时
   */
  instant: number;
  /**
   * 秒级
   */
  slow: number;
  clip: number;
};

/**
 * 生成音频音量相关的数值
 */
class SoundMeter {
  ee: EventEmitter;
  context: AudioContext;
  /**
   * 实时
   */
  instant: number;
  /**
   * 秒级
   */
  slow: number;
  clip: number;
  script: ScriptProcessorNode;
  mic: MediaStreamAudioSourceNode | undefined;
  constructor() {
    const that = this;
    this.ee = new EventEmitter();
    this.context = new AudioContext();
    this.instant = 0.0; // 实时
    this.slow = 0.0; // 秒级
    this.clip = 0.0;

    const onaudioprocess = function (event: AudioProcessingEvent) {
      const input = event.inputBuffer.getChannelData(0); // 得到一个长度为2048的数组
      let i;
      let sum = 0.0;
      let clipcount = 0;
      for (i = 0; i < input.length; ++i) {
        sum += input[i] * input[i];
        if (Math.abs(input[i]) > 0.99) {
          clipcount += 1;
        }
      }
      that.instant = Math.sqrt(sum / input.length);
      that.slow = 0.95 * that.slow + 0.05 * that.instant;
      that.clip = clipcount / input.length;
      that.ee.emit(__SoundMeter_event__, {
        instant: that.instant,
        slow: that.slow,
        clip: that.clip,
      });
    };

    // AudioWorklet
    this.script = this.context.createScriptProcessor(2048, 1, 1);
    this.script.onaudioprocess = lodash.throttle(onaudioprocess, 200);
  }
  async connectToSource(stream: MediaStream): Promise<SoundMeter> {
    return new Promise((resolve, reject) => {
      console.log('SoundMeter connecting');
      try {
        this.mic = this.context.createMediaStreamSource(stream);
        this.mic.connect(this.script);
        this.script.connect(this.context.destination);
        resolve(this);
      } catch (e) {
        console.error(e);
        reject(e);
      }
    });
  }
  stop() {
    console.log('SoundMeter 正在停止');
    this.mic?.disconnect();
    this.script?.disconnect();
  }
  on(cb: (args: StreamAudioMeter) => void) {
    this.ee.on(__SoundMeter_event__, cb);
  }
  off(cb: (args: StreamAudioMeter) => void) {
    this.ee.off(__SoundMeter_event__, cb);
  }
  destroy() {
    this.stop();
    this.mic = undefined;
  }
}

export default SoundMeter;
