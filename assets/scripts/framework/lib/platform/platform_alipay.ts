import { AudioClip } from "cc";
import EventDef from "../../../constants/EventDef";
import { SettingMgr } from "../../../manager/SettingMgr";
import CocosUtils from "../../../utils/CocosUtils";
import { qc } from "../../qc";
import platform_interface, { rewardedVideoAd } from "./platform_interface";
import { BundleConfigs } from "../../../configs/BundleConfigs";
import { PlatformConfig } from "./configs/PlatformConfig";
import Login from "../../../api/Login";
import CommonTipsMgr from "../../../manager/CommonTipsMgr";
const my = globalThis['my'];

class RewardedVideoAd {
    private _tag = '';
    private _isLoaded = false;
    /**
     * 广告实列
     */
    private _rewardedVideoAd: any = null;
    private _adUnitId: string = null;

    private _loadADErrTimes: number = 0;

    private _showCb: Function = null;
    public set showCb(cb: Function) {
        this._showCb = cb;
    }

    private _errorCb: Function = null;
    public set errorCb(cb: Function) {
        this._errorCb = cb;
    }

    private _successCb: Function = null;
    public set successCb(cb: Function) {
        this._successCb = cb;
    }

    private _failCb: Function = null;
    public set failCb(cb: Function) {
        this._failCb = cb;
    }

    constructor(adUnitId: string) {
        this._tag = platform_alipay.tag + "   " + adUnitId;
        this._adUnitId = adUnitId;
        this._rewardedVideoAd = my['createRewardedAd']({ adUnitId });
        this._rewardedVideoAd.onLoad((res) => {
            this._isLoaded = true;
            console.log(this._tag, '广告加载成功');

        });
        this._rewardedVideoAd.onClose((res) => {
            console.log(this._tag, '广告关闭', res);
            if (res.isCompleted) {
                this._successCb && this._successCb(res);
            }
            else {
                this._failCb && this._failCb(res);
            }
            this._successCb = null;
            this._failCb = null;
        });
        this._rewardedVideoAd.onError((res) => {
            console.log(this._tag, '广告组件出现问题', res);
            this._errorCb && this._errorCb(res);
            this._errorCb = null;
        });
    }

    public showAD() {
        if (this._isLoaded) {
            this._rewardedVideoAd
                .show()
                .then((res) => {
                    console.log(this._tag, '广告显示成功', res);
                    this._showCb && this._showCb(res);
                    this._showCb = null;
                })
                .catch((err) => {
                    console.log(this._tag, '广告组件出现问题', err);
                    // 再次重试加载一次          
                    this._rewardedVideoAd
                        .load()
                        .then(() => {
                            console.log(this._tag, '手动加载成功', err);
                            this._isLoaded = true;
                            this.showAD();
                        });
                })
        } else {
            if (++this._loadADErrTimes >= 3) {
                this._loadADErrTimes = 0;
                CommonTipsMgr.ins.showTips('广告加载失败,请稍后再试');
                return;
            }
            console.log(`${this._tag} 广告没加载完成`);
            this._rewardedVideoAd
                .load()
                .then(() => {
                    console.log(this._tag, '手动加载成功');
                    this._isLoaded = true;
                    this.showAD();
                });
        }
    }
}

export default class platform_alipay implements platform_interface {
    public static tag = 'alipay platform';
    private _rewardedVideoAdMap: Map<string, RewardedVideoAd> = new Map();
    private _innerAudioContext = null;
    private _isOnShow = true;
    showRewardedAd(ad: rewardedVideoAd): void {
        let rewardedVideoAd = this._rewardedVideoAdMap.get(ad.adUnitId);
        if (rewardedVideoAd) {
            rewardedVideoAd.showCb = ad.showCb;
            rewardedVideoAd.successCb = ad.successCb;
            rewardedVideoAd.failCb = ad.failCb;
            rewardedVideoAd.errorCb = ad.errorCb;
            rewardedVideoAd.showAD();

        }
        else {
            console.log(`${platform_alipay.tag + ad.adUnitId}广告未加载成功`);
        }
    }
    init() {
        let adUnitIds = PlatformConfig.ins.config.adUnitIds;
        for (let adUnitId of adUnitIds) {
            this.createRewardedAd(adUnitId);
        }

        my['onShow']((res) => {
            this._isOnShow = true;
            console.log('alipay onshow', res);
            this._onShow(res);
        });

        my['onHide']((res) => {
            this._isOnShow = false;
            console.log('alipay onhide', res);
            this._onHide(res);
        });

        my['setKeepScreenOn']({
            keepScreenOn: true,
        });

        this._innerAudioContext = my['createInnerAudioContext']();
        this._innerAudioContext['_loop'] = true;
        this._innerAudioContext['loop'] = true;
        this._innerAudioContext.onPlay(() => {
            console.log('开始播放 ', this._innerAudioContext.loop);
            if (!this._isOnShow || !SettingMgr.ins.musicEnabled) {
                this.stopMusic();
            }
        });
        this._innerAudioContext.onError((res) => {
            console.log('播放错误  ', res.errMsg)
        });
        this._innerAudioContext.onEnded(() => {
            console.log('播放结束    ', this._innerAudioContext.loop);
        });
    }

    createRewardedAd(adUnitId: string) {
        let rewardedVideoAd = new RewardedVideoAd(adUnitId);
        this._rewardedVideoAdMap.set(adUnitId, rewardedVideoAd);
    }

    private _onShow(res: any) {
        qc.eventManager.emit(EventDef.OnShow, res);
    }

    private _onHide(res: any) {
        qc.eventManager.emit(EventDef.OnHide, res);
    }

    reportScene(sceneId: number): void {

    }

    getShareInfo(cb: Function): void {
        let { query, scene, referrerInfo } = my['getLaunchOptionsSync']();
        console.log('alipay launchOptions-------  query: ', query, '  scene: ', scene, '  referrerInfo: ', referrerInfo);
        if (query) {
            if (query.adzoneId) {
                PlatformConfig.ins.config.adzoneId = query.adzoneId;
            }
            qc.platform.hdkf_share_info = query;
        }
        else {
            qc.platform.hdkf_share_info = null;
        }
        cb && cb();
    }

    vibrateShort(cb?: Function): void {
        my['vibrateShort']({
            success: () => {
                cb && cb();
            }
        });
    }

    playMusic(url: string) {
        CocosUtils.loadFromBundle<AudioClip>(BundleConfigs.audioBundle, url, AudioClip).then((clip: AudioClip) => {
            console.log('nativeurl----------------- ', clip.nativeUrl);
            this._innerAudioContext.src = clip.nativeUrl;
            this._innerAudioContext.play();
        });
    }

    stopMusic() {
        this._innerAudioContext.stop();
    }

    login(cb: Function): void {
        my['getAuthCode']({
            scopes: 'auth_base',//建议使用默认授权方式
            success: (res) => {
                console.log('my.getAuthCode 调用成功', res.authCode);
                Login.ins.login('/Public/login', { code: res.authCode, scopes: 'auth_base' }, cb);
            },
            fail: err => {
                console.log('my.getAuthCode 调用失败', err)
            }
        });
    }

    updateKeyboard(str: string): void {
        my['showKeyboard']({
            defaultValue: str
        });
    }

    hideBackButton(): void {
    }

    showBackButton(): void {
    }

    setNavigationBarStyle(title: string): void {
    }

    getUserInfo(cb: Function): void {
    }
}