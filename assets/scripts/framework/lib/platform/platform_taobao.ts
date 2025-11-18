import { AudioClip } from "cc";
import EventDef from "../../../constants/EventDef";
import { SettingMgr } from "../../../manager/SettingMgr";
import CocosUtils from "../../../utils/CocosUtils";
import { qc } from "../../qc";
import { tbCloudMgr } from "../net/tbCloudMgr";
import platform_interface, { rewardedVideoAd } from "./platform_interface";
import { BundleConfigs } from "../../../configs/BundleConfigs";
import { PlatformConfig } from "./configs/PlatformConfig";
import { httpMgr } from "../net/httpMgr";
import CommonTipsMgr from "../../../manager/CommonTipsMgr";
const my = globalThis['my'];


interface AdZoneUrl {
    linkId: string,
    linkType: string,
    linkUrl: string
}

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
        this._tag = platform_taobao.tag + "  " + adUnitId;
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

export default class platform_taobao implements platform_interface {
    public static tag = 'taobao platform';
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
            console.log(`${platform_taobao.tag + ad.adUnitId}广告未加载成功`);
        }
    }
    init() {
        console.log('init taobao');
        let adUnitIds = PlatformConfig.ins.config.adUnitIds;
        for (let adUnitId of adUnitIds) {
            this.createRewardedAd(adUnitId);
        }

        my['onShow']((res) => {
            this._isOnShow = true;
            console.log('taobao onshow', res);
            this._onShow(res);
        });

        my['onHide']((res) => {
            this._isOnShow = false;
            console.log('taobao onhide', res);
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
        console.log('jump  onhide   ', this._isJumpToAdZone, this._jumpToUrlIndex);

        if (this._isJumpToAdZone) {
            this._doJumpSuccess();
        }
        qc.eventManager.emit(EventDef.OnHide, res);
    }

    private _doJumpSuccess() {
        this._isJumpToAdZone = false;
        clearTimeout(this._jumpTimer);
        this._jumpTimer = 0;
        this._sendJumpSuccessUrlToServer(this._jumpToUrlIndex, () => {
            this._resetJumpData();
        });
    }

    reportScene(sceneId: number): void {
        const SDK = my['tb'].getInteractiveSDK()
        console.log('reportScene--------------', sceneId, SDK);

        SDK.reportScene({
            sceneId: sceneId,
            timestamp: Date.now(),
            costTime: 2000,
        })
    }

    getShareInfo(cb: Function) {
        const sdk = my['tb'].getInteractiveSDK();
        let shareInfo = sdk.getShareInfo(); // 具体使用请参考getShareInfo文档
        console.log('淘宝分享参数', shareInfo.querys)
        if (shareInfo.querys) {
            if (shareInfo.querys.adzoneId) {
                PlatformConfig.ins.config.adzoneId = shareInfo.querys.adzoneId;
                cb && cb();

                // 获取渠道链接
                this._getAdZoneUrl();
            }
            else {
                cb && cb();
            }
            qc.platform.hdkf_share_info = shareInfo.querys;
        }
        else {
            qc.platform.hdkf_share_info = null;
            cb && cb();
        }
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
        tbCloudMgr.ins.init(cb);
    }

    updateKeyboard(str: string): void {
    }

    private _isJumpToAdZone = false;
    private _jumpToUrls: AdZoneUrl[] = [];
    private _jumpToUrlIndex = 0;
    private _jumpTimer: number = 0;
    private async _getAdZoneUrl() {
        console.log('获取渠道跳转链接------------------_getAdZoneUrl');

        this._resetJumpData();
        // 获取渠道链接
        let res = await httpMgr.ins.xhrRequest<AdZoneUrl[]>('/ChannelJump/getChannelJumpNew');
        if (res && res.code === 200 && res.data) {
            this._jumpToUrls = res.data;
        }
    }

    private _jumpToAdZoneUrl(index: number) {
        console.log('_jumpToAdZoneUrl  index issssssss : === ', index);
        if (index < this._jumpToUrls.length) {
            let zoneUrl = this._jumpToUrls[index];
            console.log('_jumpToAdZoneUrl  index is : === ', index, zoneUrl.linkUrl);
            this._isJumpToAdZone = true;

            if (zoneUrl.linkUrl.indexOf('https://') === 0) {
                this._doJumpSuccess();
                if (zoneUrl.linkUrl.indexOf('https://m.tb.cn') === 0) {
                    location.replace(zoneUrl.linkUrl);
                }
                else {
                    location.href = zoneUrl.linkUrl;
                }
            }
            else {
                location.href = zoneUrl.linkUrl;
            }

            // test 
            // const sdk = my['tb'].getInteractiveSDK();
            // sdk.navigateLimitUrl({ url: zoneUrl.linkUrl })
            //     .catch(err => {
            //         console.log('navigateLimitUrl failllll  ', err)
            //     })
            // test

            this._jumpTimer = setTimeout(() => {
                console.log('jump fail   ---- ', this._isJumpToAdZone);

                if (this._isJumpToAdZone) {
                    this._isJumpToAdZone = false;
                    this._jumpToUrlIndex++;
                    console.log('jump fail   ----  _jumpToUrlIndex ', this._jumpToUrlIndex, this._jumpToUrls.length);
                    // 全部链接跳转失败
                    if (this._jumpToUrlIndex >= this._jumpToUrls.length) {
                        this._isJumpToAdZone = false;
                        clearTimeout(this._jumpTimer);
                        this._jumpTimer = 0;
                        // 全部失败，所以就从第一个开始都要发送给服务器
                        this._sendJumpFailUrlToServer(0, () => {
                            this._resetJumpData();
                        });
                    }
                    else {
                        this._jumpToAdZoneUrl(this._jumpToUrlIndex);
                    }
                }
            }, 3000);
        }
    }

    private async _sendJumpFailUrlToServer(fromIndex: number, cb: Function) {
        let failArr: { linkId: string, linkType: string }[] = [];
        for (let i = fromIndex; i < this._jumpToUrls.length; i++) {
            let adZoneUrl = this._jumpToUrls[i];
            failArr.push({ linkId: adZoneUrl.linkId, linkType: adZoneUrl.linkType });
        }
        if (failArr.length) {
            await httpMgr.ins.xhrRequest<AdZoneUrl[]>('/ChannelJump/jumpSuccess', 'GET', { failedItems: JSON.stringify(failArr), successItems: JSON.stringify([]) });
            cb && cb();
        }
        else {
            cb && cb();
        }
    }

    private async _sendJumpSuccessUrlToServer(index: number, cb: Function) {
        if (index < this._jumpToUrls.length) {
            let successArr: { linkId: string, linkType: string }[] = [];
            let adZoneUrl = this._jumpToUrls[index];
            successArr.push({ linkId: adZoneUrl.linkId, linkType: adZoneUrl.linkType });

            let failArr: { linkId: string, linkType: string }[] = [];
            for (let i = 0; i < this._jumpToUrls.length; i++) {
                if (i === index) continue;
                let adZoneUrl = this._jumpToUrls[i];
                failArr.push({ linkId: adZoneUrl.linkId, linkType: adZoneUrl.linkType });
            }
            await httpMgr.ins.xhrRequest<AdZoneUrl[]>('/ChannelJump/jumpSuccess', 'GET', { failedItems: JSON.stringify(failArr), successItems: JSON.stringify(successArr) });
            cb && cb();
        }
        else {
            cb && cb();
        }
    }

    private _resetJumpData() {
        this._isJumpToAdZone = false;
        this._jumpToUrls = [];
        this._jumpToUrlIndex = 0;
        clearTimeout(this._jumpTimer);
        this._jumpTimer = 0;
    }

    public checkNeedJumpToAdZoneUrl() {
        // test
        // this._jumpToUrls = [];
        // 碰一碰
        // this._jumpToUrls.push({ linkId: '77584', linkType: '52', linkUrl: 'alipays://platformapi/startapp?appId=20000067&url=https%3A%2F%2Frender.alipay.com%2Fp%2Fc%2F180020570000138521%2Fpy-propagate-share.html%3FappletInfo%3DkPPFvOxaCL2711fShZtlW101lIpDtOPI%26bizCode%3DSNS_NFC_FRIEND%26caprMode%3Dsync%26chInfo%3Dch_alipaysearch__chsub_normal%26shareId%3D2088152423856770' });
        // 美团
        // this._jumpToUrls.push({ linkId: '77581', linkType: '46', linkUrl: 'imeituan://www.meituan.com/msv/home?lch=wind_ZDA2NjA1MDYt___t_wind_6e55f6ed9f3e&=&fissionShareId=1984821948093665348&fissionShareScene=5&fissionShareType=0&t_wind=t_wind_6e55f6ed9f3e&_page_new=1&_speed_mode=1&no_virtual_btns=1&no_back=4000&channel_source=SJ_fx_lb_hhrlb_2&pageId=video&inner_source=10284_ch83&pageScene=3&entrance=share' });
        // 淘宝内部
        // this._jumpToUrls.push({ linkId: '77581', linkType: '46', linkUrl: 'https://m.tb.cn/h.SL5lt8V?tk=8qIQfTFRvcA' });
        // test
        if (this._jumpToUrls.length) {
            this._jumpToAdZoneUrl(this._jumpToUrlIndex);
        }
    }

    hideBackButton(): void {
        console.log(my);
        my['hideBackButton']();
    }

    showBackButton(): void {
        my['showBackButton']();
    }
    setNavigationBarStyle(title: string): void {
        my['setNavigationBarStyle']({
            title,
        });
    }

    getUserInfo(cb: Function): void {
        my['getSetting']({
            success: (res) => {
                if (!res.authSetting) {
                    console.log('no authsetting------------');
                    return;
                }
                if (res.authSetting['userInfo']) {// 用户信息已授权
                    my['getAuthUserInfo']({
                        success: (userInfo) => {
                            cb && cb(userInfo);
                        }
                    });
                }
                else {
                    my['authorize']({
                        scopes: 'scope.userInfo',
                        success: (res) => {
                            my['getAuthUserInfo']({
                                success: (userInfo) => {
                                    cb && cb(userInfo);
                                }
                            });
                        },
                    });
                }
            }
        })
    }
}