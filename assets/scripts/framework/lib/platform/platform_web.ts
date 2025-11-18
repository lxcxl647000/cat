import { musicMgr } from "../../../manager/musicMgr";
import platform_interface, { rewardedVideoAd } from "./platform_interface";

export default class platform_web implements platform_interface {
    public static tag = 'web platform';
    showRewardedAd(ad: rewardedVideoAd): void {
        ad && ad.successCb && ad.successCb();
    }
    init(): void {

    }
    createRewardedAd(adUnitId: string) {

    }

    reportScene(sceneId: number): void {

    }

    getShareInfo(cb: Function): void {

    }

    vibrateShort(cb?: Function): void {

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
        cb && cb();
    }

    updateKeyboard(str: string): void {
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