import { _decorator } from 'cc';
import { httpMgr } from '../framework/lib/net/httpMgr';
const { ccclass, property } = _decorator;

@ccclass('shezhiMgr')
export class SettingMgr {
    private static _ins: SettingMgr = null;
    public static get ins() {
        if (this._ins == null) {
            this._ins = new SettingMgr();
        }
        return this._ins;
    }

    private _vibrateEnabled: boolean = true;
    private _initVibrateEnabled: boolean = true;
    private _musicEnabled: boolean = true;
    private _initMusicEnabled: boolean = true;
    private _soundEnabled: boolean = true;
    private _initSoundEnabled: boolean = true;

    private _soundVal: number = 1;
    private _musicVal: number = .8;

    public initVibrateEnabled(val: boolean) {
        if (this._initVibrateEnabled) {
            this._initVibrateEnabled = false;
            this._vibrateEnabled = val;
        }
    }
    public initSoundEnabled(val: boolean) {
        if (this._initSoundEnabled) {
            this._initSoundEnabled = false;
            this._soundEnabled = val;
        }
    }
    public initMusicEnabled(val: boolean) {
        if (this._initMusicEnabled) {
            this._initMusicEnabled = false;
            this._musicEnabled = val;
        }
    }

    public get vibrateEnabled() {
        return this._vibrateEnabled;
    }
    public set vibrateEnabled(val: boolean) {
        this._vibrateEnabled = val;
        this.setSwitch('vibrate_on', val ? '0' : '1');

    }
    public get musicEnabled() {
        return this._musicEnabled;
    }
    public set musicEnabled(val: boolean) {
        this._musicEnabled = val;
        this.setSwitch('music_on', val ? '0' : '1');
    }

    public get soundEnabled() {
        return this._soundEnabled;
    }
    public set soundEnabled(val: boolean) {
        this._soundEnabled = val;
        this.setSwitch('sound_on', val ? '0' : '1');
    }

    public get soundVal() {
        return this._soundVal;
    }
    public set soundVal(val: number) {
        this._soundVal = val;
    }

    public get musicVal() {
        return this._musicVal;
    }
    public set musicVal(val: number) {
        this._musicVal = val;
    }

    public initMusic() {
        if (this.musicEnabled) {
            this.musicVal = 0.8
        } else {
            this.musicVal = 0
        }
    }

    public initSound() {
        if (this.soundEnabled) {
            this.soundVal = 1;
        }
        else {
            this.soundVal = 0
        }
    }

    public async setSwitch(setSwitch: string, value: string) {
        await httpMgr.ins.xhrRequest('/game/updateSwitch', 'GET', { switch: setSwitch, value });
    }
}