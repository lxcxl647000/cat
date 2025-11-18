import { _decorator, AudioClip, AudioSource, Component, Node } from 'cc';
import { SettingMgr } from './SettingMgr';
import CocosUtils from '../utils/CocosUtils';
import { BundleConfigs } from '../configs/BundleConfigs';
import { qc } from '../framework/qc';
const { ccclass, property } = _decorator;

@ccclass('musicMgr')
export class musicMgr extends Component {
    private soundComp: AudioSource = null;
    private bgmComp: AudioSource = null;

    private _curMusic: string = '';
    public get curMusic() { return this._curMusic; }
    /**
     * 单例
     */
    private static _ins: musicMgr = null!;
    public static get ins() {
        if (!this._ins) {
            this._ins = new musicMgr();
            this._ins.initAudio();
        }
        return this._ins;
    }
    /**
 * 初始化音频组件
 */
    private initAudio() {
        //   用于单次播放的音效
        this.soundComp = new AudioSource();
        this.soundComp.loop = false;
        //  用于循环播放的背景音乐
        this.bgmComp = new AudioSource();
        this.bgmComp.loop = true;
    }
    /**
  * 停止背景音乐
  */
    public stopMusic() {
        qc.platform.stopMusic();
    }
    /**
   * 设置音量
   */
    public setVolume(val) {
        this.bgmComp.volume = val
    }
    /**
     * 播放音乐
     * @param audio 音乐名
     */
    public async playMusic(audio: string) {
        if (!SettingMgr.ins.musicEnabled) {
            return;
        }
        this._curMusic = audio;
        qc.platform.playMusic(audio);
    }
    /**
    * 播放一次性音效
    */
    public async playSound(audio: string) {
        if (!SettingMgr.ins.soundEnabled) {
            return;
        }
        CocosUtils.loadFromBundle<AudioClip>(BundleConfigs.audioBundle, audio, AudioClip).then((clip: AudioClip) => {
            this.soundComp.playOneShot(clip, SettingMgr.ins.soundVal);
        });
    }

    /**
     * 使用cocos的api播放音乐
     */
    public playMusicByCocos(audio: string) {
        if (!SettingMgr.ins.musicEnabled) {
            return;
        }
        this.bgmComp.stop();
        CocosUtils.loadFromBundle<AudioClip>(BundleConfigs.audioBundle, audio, AudioClip).then((clip: AudioClip) => {
            this.bgmComp.clip = clip;
            this.bgmComp.play();
        });
    }

    /**
     * 使用cocos的api停止音乐
     */
    public stopMusicByCocos() {
        this.bgmComp.stop();
    }
}


