import Login from "../../../api/Login";
import EventDef from "../../../constants/EventDef";
import CommonTipsMgr from "../../../manager/CommonTipsMgr";
import { musicMgr } from "../../../manager/musicMgr";
import { qc } from "../../qc";
import { PlatformConfig } from "./configs/PlatformConfig";
import platform_interface, { rewardedVideoAd } from "./platform_interface";

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
        this._tag = platform_wx.tag + "   " + adUnitId;
        this._adUnitId = adUnitId;
        this._rewardedVideoAd = wx.createRewardedVideoAd({
            adUnitId: adUnitId,
            multiton: true,
        });
        this._rewardedVideoAd.onLoad((res) => {
            this._isLoaded = true;
            console.log(this._tag, '广告加载成功');

        });
        this._rewardedVideoAd.onClose((res) => {
            console.log(this._tag, '广告关闭', res);
            if (res.isEnded) {
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

export default class platform_wx implements platform_interface {
    public static tag = 'wx platform';
    private _rewardedVideoAdMap: Map<string, RewardedVideoAd> = new Map();

    showRewardedAd(ad: rewardedVideoAd): void {
        // 没有广告位之前直接返回失败
        ad && ad.failCb && ad.failCb();
    }
    init(): void {
        console.log('init wx');
        let adUnitIds = PlatformConfig.ins.config.adUnitIds;
        for (let adUnitId of adUnitIds) {
            this.createRewardedAd(adUnitId);
        }

        wx.onShow((res) => {
            console.log('wx onshow', res);
            this._onShow(res);
        });

        wx.onHide((res) => {
            console.log('wx onhide', res);
            this._onHide(res);
        });
    }

    private _onShow(res: any) {
        qc.eventManager.emit(EventDef.OnShow, res);
    }

    private _onHide(res: any) {
        qc.eventManager.emit(EventDef.OnHide, res);
    }

    createRewardedAd(adUnitId: string) {
        let rewardedVideoAd = new RewardedVideoAd(adUnitId);
        this._rewardedVideoAdMap.set(adUnitId, rewardedVideoAd);
    }

    reportScene(sceneId: number): void {

    }

    getShareInfo(cb: Function): void {
        let { query, scene, referrerInfo } = wx.getLaunchOptionsSync();
        console.log('wx launchOptions-------  query: ', query, '  scene: ', scene, '  referrerInfo: ', referrerInfo);
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
        if (wx.vibrateShort) wx.vibrateShort({});
    }

    playMusic(url: string) {
        // 暂时先用cocos的api播放
        musicMgr.ins.playMusicByCocos(url);
    }

    stopMusic() {
        // 暂时先用cocos的api停止
        musicMgr.ins.stopMusicByCocos();
    }

    login(cb: Function): void {
        wx.login({
            success(res) {
                if (res.code) {
                    console.log('登录成功！' + res.code);
                    Login.ins.login('/Public/wxLogin', { code: res.code }, cb);
                } else {
                    console.log('登录失败！' + res.errMsg);
                }
            },
            fail(res) {
                console.log('登录失败！' + res.errMsg);
            }
        });
    }

    updateKeyboard(str: string): void {
        wx.updateKeyboard({
            value: str
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