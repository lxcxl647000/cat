import CommonTipsMgr from "../../../manager/CommonTipsMgr";
import { SettingMgr } from "../../../manager/SettingMgr";
import { qc } from "../../qc";
import adapter from "./adapter/adapter";
import { PlatformConfig } from "./configs/PlatformConfig";
import { platformConfig_alipay } from "./configs/PlatformConfig_alipay";
import { platformConfig_taobao } from "./configs/PlatformConfig_taobao";
import { platformConfig_tt } from "./configs/PlatformConfig_tt";
import { platformConfig_web } from "./configs/PlatformConfig_web";
import { platformConfig_wx } from "./configs/PlatformConfig_wx";
import platform_alipay from "./platform_alipay";
import platform_bilibili from "./platform_bilibili";
import platform_interface, { rewardedVideoAd } from "./platform_interface";
import platform_taobao from "./platform_taobao";
import platform_tt, { ttLaunch } from "./platform_tt";
import platform_web from "./platform_web";
import platform_wx from "./platform_wx";

export default class platform implements platform_interface {
    private static TAG: string = "platform";
    private _platform: platform_interface = null;
    public get platform() {
        return this._platform;
    }
    private _hdkf_share_info: any = null;
    public get hdkf_share_info() {
        return this._hdkf_share_info;
    }
    public set hdkf_share_info(info: any) {
        this._hdkf_share_info = info;
    }

    private _ttLaunch: ttLaunch = null;
    public get ttLaunch() {
        return this._ttLaunch;
    }
    public set ttLaunch(info: ttLaunch) {
        this._ttLaunch = info;
    }

    public init() {
        if (adapter.inst.onTaobao()) {
            this._platform = new platform_taobao();
            PlatformConfig.ins.config = platformConfig_taobao;
            platform.TAG = platform_taobao.tag;
            console.log(platform.TAG + "::init->平台:淘宝小游戏");
        }
        else if (adapter.inst.onWx()) {
            this._platform = new platform_wx();
            PlatformConfig.ins.config = platformConfig_wx;
            platform.TAG = platform_wx.tag;
            console.log(platform.TAG + "::init->平台:wx小游戏");
        }
        else if (adapter.inst.onBilibili()) {
            this._platform = new platform_bilibili();
            platform.TAG = platform_bilibili.tag;
            console.log(platform.TAG + "::init->平台:bilibili小游戏");
        }
        else if (adapter.inst.onTt()) {
            this._platform = new platform_tt();
            PlatformConfig.ins.config = platformConfig_tt;
            platform.TAG = platform_tt.tag;
            console.log(platform.TAG + "::init->平台:tt小游戏");
        }
        else if (adapter.inst.onAlipay()) {
            this._platform = new platform_alipay();
            PlatformConfig.ins.config = platformConfig_alipay;
            platform.TAG = platform_alipay.tag;
            console.log(platform.TAG + "::init->平台:alipay小游戏");
        }
        else {
            this._platform = new platform_web();
            PlatformConfig.ins.config = platformConfig_web;
            platform.TAG = platform_web.tag;
            console.log(platform.TAG + "::init->平台:web");
        }
        if (this._platform) {
            this._platform.init();
        }
    }

    createRewardedAd(adUnitId: string) {

    }

    showRewardedAd(ad: rewardedVideoAd): void {
        this._platform.showRewardedAd(ad);
    }

    // 从其他小程序跳过来完成任务：闯关、看广告//
    fromOtherAppToCompleteTask(type: string): void {
        if (qc.platform.hdkf_share_info) {
            let data = qc.platform.hdkf_share_info;
            if (data.taskSign) {
                let sendToServer = (tips: string) => {
                    let TaskValue = data.taskSign;
                    let url = `https://mobile.yundps.com/TaoBaoCallback/taskCallback?taskSign=${TaskValue}`;
                    let httpRequest = new XMLHttpRequest(); //第一步：建立所需的对象
                    httpRequest.open('GET', url, true); //第二步：打开连接  将请求参数写在url中  ps:"./Ptest.php?name=test&nameone=testone"
                    httpRequest.send(); //第三步：发送请求  将请求参数写在URL中
                    /**
                    * 获取数据后的处理程序
                    */
                    httpRequest.onreadystatechange = function () {
                        if (httpRequest.readyState == 4 && httpRequest.status == 200) {
                            var json = httpRequest.responseText; //获取到json字符串，还需解析
                            console.log(json, '发送了请求');
                            CommonTipsMgr.ins.showTips(tips);
                            qc.platform.hdkf_share_info = null;
                        } else {

                        }
                    };
                }
                if (data.info_data) {
                    const infoData = JSON.parse(data.info_data?.replace(/'/g, '"'));

                    // 从其他小程序跳过闯关完成任务
                    if (infoData.taskType === 'game') {
                        type === 'game' && sendToServer('闯关已完成');
                    } else {
                        let num = 0
                        if (data.adTime == 15) {
                            num = 1
                        }
                        console.log(data, '数据', data.taskSign);
                        setTimeout(() => {
                            let ad: rewardedVideoAd = {
                                adUnitId: PlatformConfig.ins.config.adUnitIds[num],
                                successCb: () => {
                                    sendToServer('浏览已完成');
                                },
                                failCb: (e) => {
                                    if (!e.isCompleted) {
                                        CommonTipsMgr.ins.showTips('浏览未完成');
                                    }
                                },
                                errorCb: () => {
                                    CommonTipsMgr.ins.showTips('浏览未完成');
                                }
                            }
                            qc.platform.showRewardedAd(ad);
                        }, 1500);
                    }
                    // 从其他小程序调过来看视频完成任务
                } else {
                    let num = 0
                    if (data.adTime == 15) {
                        num = 1
                    }
                    console.log(data, '数据', data.taskSign);
                    setTimeout(() => {
                        let ad: rewardedVideoAd = {
                            adUnitId: PlatformConfig.ins.config.adUnitIds[num],
                            successCb: () => {
                                sendToServer('浏览已完成');
                            },
                            failCb: (e) => {
                                if (!e.isCompleted) {
                                    CommonTipsMgr.ins.showTips('浏览未完成');
                                }
                            },
                            errorCb: () => {
                                CommonTipsMgr.ins.showTips('浏览未完成');
                            }
                        }
                        qc.platform.showRewardedAd(ad);
                    }, 1500);
                }
            }
        }
    }

    reportScene(sceneId: number): void {
        this._platform.reportScene(sceneId);
    }

    getShareInfo(cb: Function): void {
        this._platform.getShareInfo(cb);
    }

    vibrateShort(cb?: Function): void {
        if (SettingMgr.ins.vibrateEnabled) {
            this._platform.vibrateShort(cb);
        }
    }

    playMusic(url: string) {
        this._platform.playMusic(url);
    }

    stopMusic() {
        this._platform.stopMusic();
    }

    login(cb: Function): void {
        this._platform.login(cb);
    }

    updateKeyboard(str: string): void {
        this._platform.updateKeyboard(str);
    }

    checkScene(cb: Function) {
        if (adapter.inst.onTt()) {
            let tt_platform = this._platform as platform_tt;
            if (tt_platform && tt_platform.checkScene) {
                tt_platform.checkScene(cb);
            }
        }
    }

    navigateToScene(scene: string) {
        if (adapter.inst.onTt()) {
            let tt_platform = this._platform as platform_tt;
            if (tt_platform && tt_platform.navigateToScene) {
                tt_platform.navigateToScene(scene);
            }
        }
    }

    checkNotDisplayRedPack() {
        return adapter.inst.onTt() || adapter.inst.onWx();
    }

    hideBackButton(): void {
        this._platform.hideBackButton();
    }

    showBackButton(): void {
        this._platform.showBackButton();
    }

    setNavigationBarStyle(title: string): void {
        this._platform.setNavigationBarStyle(title);
    }

    getUserInfo(cb: Function): void {
        this._platform.getUserInfo(cb);
    }

    platformTag(): string {
        return platform.TAG;
    }
}