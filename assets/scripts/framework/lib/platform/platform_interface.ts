export default interface platform_interface {
    init(): void

    // 激励广告//
    createRewardedAd(adUnitId: string): any
    showRewardedAd(ad: rewardedVideoAd): void
    // 上报场景值//
    reportScene(sceneId: number): void
    // 获取分享信息//
    getShareInfo(cb: Function): void
    // 短震动
    vibrateShort(cb?: Function): void
    // 播放音乐
    playMusic(url: string): void
    // 停止音乐
    stopMusic(): void
    // 登录
    login(cb: Function): void
    // 更新键盘输入框内容
    updateKeyboard(str: string): void
    // 隐藏平台返回按钮
    hideBackButton(): void
    // 显示平台返回按钮
    showBackButton(): void
    // 设置导航栏
    setNavigationBarStyle(title: string): void
    // 获取用户信息
    getUserInfo(cb: Function): void
}

export interface rewardedVideoAd {
    adUnitId: string,
    showCb?: Function,
    successCb?: Function,
    failCb?: Function,
    errorCb?: Function
}